import axios from 'axios';
import getNgrokConfig from '../config/ngrok';

const config = getNgrokConfig();
const API_BASE_URL = process.env.REACT_APP_API_URL || config.API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      // Don't redirect here - let the AuthContext handle it
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth', { email, password }).then(res => res.data),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }).then(res => res.data),
  getCurrentUser: () => api.get('/auth').then(res => res.data),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users').then(res => res.data),
  getUser: (id) => api.get(`/users/${id}`).then(res => res.data),
  updateUser: (id, data) => api.put(`/users/${id}`, data).then(res => res.data),
};

// Contacts API
export const contactsAPI = {
  getContacts: () => api.get('/contacts').then(res => res.data),
  addContact: (data) => api.post('/contacts', data).then(res => res.data),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data).then(res => res.data),
  deleteContact: (id) => api.delete(`/contacts/${id}`).then(res => res.data),
};

// Chats API
export const chatsAPI = {
  getChats: () => api.get('/chats').then(res => res.data),
  getChat: (id) => api.get(`/chats/${id}`).then(res => res.data),
  createChat: (data) => api.post('/chats', data).then(res => res.data),
  updateChat: (id, data) => api.put(`/chats/${id}`, data).then(res => res.data),
  deleteChat: (id) => api.delete(`/chats/${id}`).then(res => res.data),
};

// Messages API
export const messagesAPI = {
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`).then(res => res.data),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data).then(res => res.data),
  updateMessage: (messageId, data) => api.put(`/messages/${messageId}`, data).then(res => res.data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`).then(res => res.data),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`).then(res => res.data),
};

// Calls API
export const callsAPI = {
  startCall: (data) => api.post('/calls', data).then(res => res.data),
  endCall: (callId) => api.put(`/calls/${callId}/end`).then(res => res.data),
  getCallHistory: () => api.get('/calls').then(res => res.data),
};

export default api;
