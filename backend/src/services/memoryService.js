/**
 * Conversation memory management for persistent chat history
 */
class ConversationMemory {
  constructor() {
    this.conversations = new Map(); // sessionId -> messages[]
    this.metadata = new Map(); // sessionId -> metadata
  }

  /**
   * Create a new conversation session
   * @param {string} sessionId - Unique session identifier
   * @param {Object} metadata - Session metadata
   * @returns {string} Session ID
   */
  createSession(sessionId, metadata = {}) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
      this.metadata.set(sessionId, {
        ...metadata,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
    }
    return sessionId;
  }

  /**
   * Add a message to conversation history
   * @param {string} sessionId - Session ID
   * @param {string} role - Message role (user/assistant)
   * @param {string} content - Message content
   * @returns {Object} Message object
   */
  addMessage(sessionId, role, content) {
    if (!this.conversations.has(sessionId)) {
      this.createSession(sessionId);
    }

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date().toISOString()
    };

    this.conversations.get(sessionId).push(message);
    
    // Update last activity
    const meta = this.metadata.get(sessionId);
    if (meta) {
      meta.lastActivity = new Date().toISOString();
    }

    return message;
  }

  /**
   * Get conversation history
   * @param {string} sessionId - Session ID
   * @param {number} limit - Maximum messages to return
   * @returns {Array<Object>} Message history
   */
  getHistory(sessionId, limit = 50) {
    const messages = this.conversations.get(sessionId) || [];
    return messages.slice(-limit);
  }

  /**
   * Get formatted context for LLM
   * @param {string} sessionId - Session ID
   * @param {number} contextWindow - Number of recent messages
   * @returns {string} Formatted conversation context
   */
  getContextForLLM(sessionId, contextWindow = 10) {
    const messages = this.getHistory(sessionId, contextWindow);
    
    return messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Clear conversation history
   * @param {string} sessionId - Session ID
   */
  clearSession(sessionId) {
    this.conversations.delete(sessionId);
    this.metadata.delete(sessionId);
  }

  /**
   * Get session metadata
   * @param {string} sessionId - Session ID
   * @returns {Object} Session metadata
   */
  getSessionMetadata(sessionId) {
    return this.metadata.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   * @returns {Array<Object>} Active sessions
   */
  getAllSessions() {
    const sessions = [];
    
    for (const [sessionId, messages] of this.conversations.entries()) {
      const meta = this.metadata.get(sessionId);
      sessions.push({
        sessionId,
        messageCount: messages.length,
        ...meta
      });
    }

    return sessions;
  }

  /**
   * Clean up old sessions (older than specified hours)
   * @param {number} hoursOld - Hours threshold
   */
  cleanupOldSessions(hoursOld = 24) {
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);

    for (const [sessionId, meta] of this.metadata.entries()) {
      const lastActivity = new Date(meta.lastActivity).getTime();
      
      if (lastActivity < cutoffTime) {
        this.clearSession(sessionId);
      }
    }
  }

  /**
   * Export conversation history
   * @param {string} sessionId - Session ID
   * @returns {Object} Exportable conversation data
   */
  exportConversation(sessionId) {
    return {
      sessionId,
      metadata: this.metadata.get(sessionId),
      messages: this.conversations.get(sessionId) || [],
      exportedAt: new Date().toISOString()
    };
  }
}

// Singleton instance
const conversationMemory = new ConversationMemory();

// Auto-cleanup old sessions every hour
setInterval(() => {
  conversationMemory.cleanupOldSessions(24);
}, 60 * 60 * 1000);

export default conversationMemory;