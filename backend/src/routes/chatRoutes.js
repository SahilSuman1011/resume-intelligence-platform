import express from 'express';
import { 
  chatWithResume, 
  getChatHistory, 
  clearChatHistory,
  getAllSessions,
  exportConversation 
} from '../controllers/chatController.js';

const router = express.Router();

// Chat with resume
router.post('/', chatWithResume);

// Get all sessions
router.get('/sessions', getAllSessions);

// Get chat history for a session
router.get('/sessions/:sessionId', getChatHistory);

// Clear chat history
router.delete('/sessions/:sessionId', clearChatHistory);

// Export conversation
router.get('/sessions/:sessionId/export', exportConversation);

export default router;