// Database configuration (In-memory for now)
// This file is prepared for future database integration

class InMemoryDatabase {
  constructor() {
    this.jobs = new Map();
    this.resumes = new Map();
    this.conversations = new Map();
  }

  // Job operations
  saveJob(id, jobData) {
    this.jobs.set(id, jobData);
    return jobData;
  }

  getJob(id) {
    return this.jobs.get(id);
  }

  getAllJobs() {
    return Array.from(this.jobs.values());
  }

  deleteJob(id) {
    return this.jobs.delete(id);
  }

  // Resume operations
  saveResume(id, resumeData) {
    this.resumes.set(id, resumeData);
    return resumeData;
  }

  getResume(id) {
    return this.resumes.get(id);
  }

  getAllResumes() {
    return Array.from(this.resumes.values());
  }

  deleteResume(id) {
    return this.resumes.delete(id);
  }

  // Conversation operations
  saveConversation(id, conversationData) {
    this.conversations.set(id, conversationData);
    return conversationData;
  }

  getConversation(id) {
    return this.conversations.get(id);
  }

  deleteConversation(id) {
    return this.conversations.delete(id);
  }

  // Clear all data
  clearAll() {
    this.jobs.clear();
    this.resumes.clear();
    this.conversations.clear();
  }
}

// Singleton instance
const db = new InMemoryDatabase();

export default db;