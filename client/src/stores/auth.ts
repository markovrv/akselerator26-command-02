import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

interface User {
  id: number
  email: string
  name: string
  role: 'seeker' | 'student' | 'admin'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function register(email: string, name: string, role: 'seeker' | 'student') {
    try {
      const response = await api.post('/auth/register', { email, name, role })
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('token', token.value!)
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  async function login(email: string) {
    try {
      const response = await api.post('/auth/login', { email })
      if (response.data.success) {
        token.value = response.data.data.token
        user.value = response.data.data.user
        localStorage.setItem('token', token.value!)
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      return response.data
    } catch (error: any) {
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchProfile() {
    try {
      const response = await api.get('/users/profile')
      if (response.data.success) {
        user.value = response.data.data.user
        localStorage.setItem('user', JSON.stringify(user.value))
        return response.data.data
      }
    } catch (error) {
      throw error
    }
  }

  // Восстанавливаем сессию при загрузке
  if (token.value) {
    fetchProfile().catch(() => {
      // Токен протух — чистим
      logout()
    })
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    fetchProfile
  }
})
