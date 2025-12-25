import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Job API
export const jobAPI = {
  create: async (data) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },
  
  getById: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },
  
  delete: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },
};

// Resume API
export const resumeAPI = {
  upload: async (formData) => {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },
  
  getById: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`);
    return response.data;
  },
  
  compare: async (resumeId, jobId) => {
    const response = await api.get(`/resumes/${resumeId}/compare/${jobId}`);
    return response.data;
  },
  
  getTopForJob: async (jobId) => {
    const response = await api.get(`/resumes/ranking/job/${jobId}`);
    return response.data;
  },
  
  delete: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (data) => {
    const response = await api.post('/chat', data);
    return response.data;
  },
  
  getHistory: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  clearHistory: async (sessionId) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  },
  
  getAllSessions: async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
  },
  
  exportConversation: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/export`);
    return response.data;
  },
};

export default api;