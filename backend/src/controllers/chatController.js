import { queryResumeRAG } from '../services/ragService.js';
import conversationMemory from '../services/memoryService.js';
import db from '../config/db.js';

/**
 * Chat with a resume using RAG
 */
export async function chatWithResume(req, res) {
  try {
    const { resumeId, message, sessionId } = req.body;

    if (!message || !resumeId) {
      return res.status(400).json({ 
        error: 'Resume ID and message are required' 
      });
    }

    // Verify resume exists
    const resume = db.getResume(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Create or get session
    const actualSessionId = sessionId || `session-${resumeId}-${Date.now()}`;
    conversationMemory.createSession(actualSessionId, { resumeId });

    // Add user message to memory
    conversationMemory.addMessage(actualSessionId, 'user', message);

    // Get conversation context
    const conversationContext = conversationMemory.getContextForLLM(actualSessionId, 5);

    // Query using RAG
    const ragResponse = await queryResumeRAG(resumeId, message);

    // Build response with conversation context
    let finalAnswer = ragResponse.answer;

    // If we have conversation history, add context awareness
    if (conversationContext) {
      finalAnswer = `${ragResponse.answer}`;
    }

    // Add assistant response to memory
    conversationMemory.addMessage(actualSessionId, 'assistant', finalAnswer);

    res.json({
      success: true,
      response: finalAnswer,
      context: ragResponse.context,
      confidence: ragResponse.confidence,
      sessionId: actualSessionId,
      conversationHistory: conversationMemory.getHistory(actualSessionId)
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get chat history for a session
 */
export async function getChatHistory(req, res) {
  try {
    const { sessionId } = req.params;

    const history = conversationMemory.getHistory(sessionId);
    const metadata = conversationMemory.getSessionMetadata(sessionId);

    if (!metadata) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      sessionId,
      history,
      metadata
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Clear chat history for a session
 */
export async function clearChatHistory(req, res) {
  try {
    const { sessionId } = req.params;

    conversationMemory.clearSession(sessionId);

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get all active chat sessions
 */
export async function getAllSessions(req, res) {
  try {
    const sessions = conversationMemory.getAllSessions();

    res.json({
      success: true,
      sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Export conversation
 */
export async function exportConversation(req, res) {
  try {
    const { sessionId } = req.params;

    const conversation = conversationMemory.exportConversation(sessionId);

    if (!conversation.metadata) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error exporting conversation:', error);
    res.status(500).json({ error: error.message });
  }
}