// src/store/authStore.js
import { create } from 'zustand';
import { authAPI, profileAPI } from '../services/api';
import { useAssessmentStore } from './assessmentStore';

// Вспомогательная функция: назначает роль и получает новый токен с enterpriseId
async function ensureEnterpriseToken(email, password, enterpriseId) {
  if (!enterpriseId) {
    throw new Error('Enterprise ID is required for enterprise_user');
  }
  try {
    // Пытаемся назначить роль (может быть уже назначена – ошибку игнорируем)
    await profileAPI.setRole('enterprise_user', enterpriseId);
  } catch (error) {
    // Если роль уже установлена, запрос может вернуть ошибку – ничего страшного
    console.warn('setRole attempt:', error.response?.data?.error || error.message);
  }
  // Повторный логин для получения токена, содержащего enterpriseId
  const { data } = await authAPI.login(email, password);
  return data;
}

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
      // Первичный логин
      let { data } = await authAPI.login(email, password);

      // Если пользователь – представитель предприятия, обеспечиваем наличие enterpriseId в токене
      if (data.user.role === 'enterprise_user') {
        // enterpriseId может храниться в localStorage после регистрации
        const enterpriseId = localStorage.getItem('hr_enterprise_id');
        if (enterpriseId) {
          data = await ensureEnterpriseToken(email, password, enterpriseId);
        }
        // Если enterpriseId нет – выходим с обычным токеном (первый вход без localStorage).
        // В этом случае первый же запрос к /enterprise/* упадёт с ошибкой, и можно будет
        // реализовать восстановление (см. рекомендации в конце).
      }

      // Сохраняем финальный токен и пользователя
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
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, fullName, role, enterpriseId) => {
    set({ isLoading: true, error: null });
    try {
      // Регистрация (если роль enterprise_user, передаём enterpriseId)
      let { data } = await authAPI.register(email, password, fullName, role, enterpriseId);

      if (role === 'enterprise_user' && enterpriseId) {
        // Сохраняем enterpriseId в localStorage, чтобы использовать при последующих входах
        localStorage.setItem('hr_enterprise_id', enterpriseId);
        // Назначаем роль и получаем новый токен
        data = await ensureEnterpriseToken(email, password, enterpriseId);
      }

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
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    useAssessmentStore.getState().reset();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('hr_enterprise_id');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));