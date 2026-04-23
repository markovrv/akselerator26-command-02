import { create } from 'zustand';
import { authAPI } from '../services/api';
import { useAssessmentStore } from './assessmentStore'; // добавлен импорт

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      // Восстанавливаем сессию анкеты после входа
      useAssessmentStore.getState().restoreSession();
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, fullName, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authAPI.register(email, password, fullName, role);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
      useAssessmentStore.getState().restoreSession();
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Принудительно сбрасываем сессию анкеты
    useAssessmentStore.getState().reset();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Синхронизация между вкладками (оставляем, но исправляем)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken' || event.key === 'user') {
      const accessToken = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user')) || null;
      useAuthStore.setState({
        accessToken,
        isAuthenticated: !!accessToken,
        user,
      });
      if (!accessToken) {
        // Пользователь вышел в другой вкладке – сбрасываем анкету
        useAssessmentStore.getState().reset();
      } else {
        // Вход в другой вкладке – пробуем восстановить сессию анкеты
        useAssessmentStore.getState().restoreSession();
      }
    }
  });
}