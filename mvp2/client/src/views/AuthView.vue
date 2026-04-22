<template>
  <div class="auth-view">
    <div class="auth-container">
      <h2>{{ isLogin ? 'Вход' : 'Регистрация' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required
            placeholder="your@email.com"
          />
        </div>

        <div class="form-group" v-if="!isLogin">
          <label for="name">Имя</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            required
            placeholder="Иван Иванов"
          />
        </div>

        <div class="form-group" v-if="!isLogin">
          <label for="role">Роль</label>
          <select id="role" v-model="form.role" required>
            <option value="seeker">Соискатель</option>
            <option value="student">Студент</option>
          </select>
        </div>

        <button type="submit" class="btn-submit">
          {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="auth-switch">
        <p>
          {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLogin = computed(() => route.name === 'login')

const form = ref({
  email: '',
  name: '',
  role: 'seeker' as 'seeker' | 'student'
})

async function handleSubmit() {
  try {
    if (isLogin.value) {
      await authStore.login(form.value.email)
      router.push('/')
    } else {
      await authStore.register(form.value.email, form.value.name, form.value.role)
      // Регистрация сразу выдаёт токен — идём на главную
      router.push('/')
    }
  } catch (error: any) {
    console.error('Auth error:', error)
    alert(error?.response?.data?.error?.message || 'Ошибка авторизации')
  }
}

function toggleMode() {
  router.push(isLogin.value ? '/register' : '/login')
}
</script>

<style scoped lang="scss">
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.auth-container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
}

.auth-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
    }

    input,
    select {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #667eea;
      }
    }
  }
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.auth-switch {
  text-align: center;
  margin-top: 20px;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }
}
</style>
