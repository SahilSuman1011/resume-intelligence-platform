// Conversation Model - Data structure for chat sessions

class Conversation {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.resumeId = data.resumeId;
    this.messages = data.messages || [];
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastActivity = data.lastActivity || new Date().toISOString();
  }

  generateId() {
    return `conversation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add a message to conversation
  addMessage(role, content, metadata = {}) {
    const message = {
      id: this.generateMessageId(),
      role, // 'user' or 'assistant'
      content,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.messages.push(message);
    this.lastActivity = message.timestamp;

    return message;
  }

  generateMessageId() {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get last N messages
  getRecentMessages(limit = 10) {
    return this.messages.slice(-limit);
  }

  // Get messages for LLM context
  getContextMessages(limit = 5) {
    return this.getRecentMessages(limit).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Format conversation history for LLM
  formatForLLM(contextWindow = 10) {
    const recentMessages = this.getRecentMessages(contextWindow);
    
    return recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  // Get message count
  getMessageCount() {
    return this.messages.length;
  }

  // Get conversation duration
  getDuration() {
    if (this.messages.length === 0) return 0;
    
    const firstMessage = new Date(this.messages[0].timestamp);
    const lastMessage = new Date(this.lastActivity);
    
    return lastMessage - firstMessage; // milliseconds
  }

  // Check if conversation is active
  isActive(timeoutMs = 24 * 60 * 60 * 1000) { // 24 hours default
    const lastActivityTime = new Date(this.lastActivity);
    const now = new Date();
    
    return (now - lastActivityTime) < timeoutMs;
  }

  // Clear all messages
  clearMessages() {
    this.messages = [];
    this.lastActivity = new Date().toISOString();
  }

  // Delete specific message
  deleteMessage(messageId) {
    const index = this.messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  // Get conversation summary
  getSummary() {
    return {
      id: this.id,
      resumeId: this.resumeId,
      messageCount: this.messages.length,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      duration: this.getDuration(),
      isActive: this.isActive()
    };
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      resumeId: this.resumeId,
      messages: this.messages,
      metadata: this.metadata,
      messageCount: this.messages.length,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity
    };
  }

  // Export conversation (for download)
  exportConversation() {
    return {
      conversationId: this.id,
      resumeId: this.resumeId,
      messages: this.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      summary: this.getSummary(),
      exportedAt: new Date().toISOString()
    };
  }

  // Validate conversation
  validate() {
    const errors = [];

    if (!this.resumeId) {
      errors.push('Resume ID is required');
    }

    if (this.messages && !Array.isArray(this.messages)) {
      errors.push('Messages must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update metadata
  updateMetadata(data) {
    this.metadata = { ...this.metadata, ...data };
  }
}

export default Conversation;