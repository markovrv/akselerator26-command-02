import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email, password, fullName, role) =>
    api.post('/auth/register', { email, password, fullName, role }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),
  verifyEmail: () =>
    api.post('/auth/verify-email'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.patch('/profile', data),
  setRole: (role) => api.post('/profile/role', { role }),
};

// Assessment API
export const assessmentAPI = {
  getQuestions: () => api.get('/assessment/questions'),
  startAssessment: (roleContext) =>
    api.post('/assessment/start', { roleContext }),
  answerQuestion: (sessionId, questionCode, answer) =>
    api.post(`/assessment/${sessionId}/answer`, { questionCode, answer }),
  completeAssessment: (sessionId) =>
    api.post(`/assessment/${sessionId}/complete`),
};

// Recommendations API
export const recommendationsAPI = {
  generateRecommendations: (sessionId, filters) =>
    api.post('/recommendations/generate', {}, { params: { sessionId, ...filters } }),
  getRecommendations: (sessionId) =>
    api.get('/recommendations', { params: { sessionId } }),
};

// Enterprises API
export const enterprisesAPI = {
  getAll: (filters) => api.get('/enterprises', { params: filters }),
  getBySlug: (slug) => api.get(`/enterprises/${slug}`),
};

// Vacancies API
export const vacanciesAPI = {
  getAll: (filters) => api.get('/vacancies', { params: filters }),
  getById: (id) => api.get(`/vacancies/${id}`),
};

// Tours API
export const toursAPI = {
  getAll: (filters) => api.get('/tours', { params: filters }),
  getById: (id) => api.get(`/tours/${id}`),
  book: (id) => api.post(`/tours/${id}/book`),
  getMyBookings: () => api.get('/tours/me/bookings'),
};

// Applications API
export const applicationsAPI = {
  create: (vacancyId, type, coverNote) =>
    api.post('/applications', { vacancyId, type, coverNote }),
  getMyApplications: () => api.get('/applications/me'),
  getEnterpriseApplications: (enterpriseId) =>
    api.get('/applications/enterprise', { params: { enterpriseId } }),
  updateStatus: (id, status) =>
    api.patch(`/applications/${id}/status`, { status }),
};

export default api;
