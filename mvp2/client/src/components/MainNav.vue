<template>
  <header class="main-nav" :class="{ scrolled: isScrolled }">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🏭</span>
        <span class="logo-text">Вперёд</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-link" exact-active-class="active">
          Главная
        </router-link>
        <router-link to="/test" class="nav-link" active-class="active" v-if="authStore.isAuthenticated">
          Тест
        </router-link>
        <router-link to="/enterprises" class="nav-link" active-class="active">
          Предприятия
        </router-link>
        <router-link to="/vacancies" class="nav-link" active-class="active">
          Вакансии
        </router-link>
        <router-link to="/excursions" class="nav-link" active-class="active">
          Экскурсии
        </router-link>
        <router-link to="/profile" class="nav-link" active-class="active" v-if="authStore.isAuthenticated">
          Мои рекомендации
        </router-link>
      </nav>

      <div class="nav-actions">
        <template v-if="authStore.isAuthenticated">
          <router-link to="/profile" class="nav-profile">
            <span class="profile-avatar">{{ authStore.user?.name?.charAt(0).toUpperCase() }}</span>
            <span class="profile-name">{{ authStore.user?.name }}</span>
          </router-link>
          <VaButton preset="secondary" size="small" @click="logout">
            Выйти
          </VaButton>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Войти</router-link>
          <router-link to="/register">
            <VaButton size="small">Регистрация</VaButton>
          </router-link>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <div class="mobile-menu" v-if="mobileOpen">
      <router-link to="/" class="mobile-link" @click="mobileOpen = false">Главная</router-link>
      <router-link to="/test" class="mobile-link" v-if="authStore.isAuthenticated" @click="mobileOpen = false">Тест</router-link>
      <router-link to="/enterprises" class="mobile-link" @click="mobileOpen = false">Предприятия</router-link>
      <router-link to="/vacancies" class="mobile-link" @click="mobileOpen = false">Вакансии</router-link>
      <router-link to="/excursions" class="mobile-link" @click="mobileOpen = false">Экскурсии</router-link>
      <router-link to="/profile" class="mobile-link" v-if="authStore.isAuthenticated" @click="mobileOpen = false">Мои рекомендации</router-link>
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login" class="mobile-link" @click="mobileOpen = false">Войти</router-link>
        <router-link to="/register" class="mobile-link" @click="mobileOpen = false">Регистрация</router-link>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 10
}

function logout() {
  authStore.logout()
  router.push('/')
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped lang="scss">
.main-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  transition: box-shadow 0.3s ease;

  &.scrolled {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.02em;
  }
}

.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  padding: 8px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  &.active {
    background: #dbeafe;
    color: #2563eb;
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
}

.profile-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;

  span {
    display: block;
    width: 20px;
    height: 2px;
    background: #0f172a;
    border-radius: 2px;
  }
}

.mobile-menu {
  display: none;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.mobile-link {
  display: block;
  padding: 12px 0;
  font-size: 1rem;
  color: #475569;
  text-decoration: none;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

@media (max-width: 900px) {
  .nav-links { display: none; }
  .profile-name { display: none; }
  .mobile-toggle { display: flex; }
  .mobile-menu { display: block; }
  .nav-container { gap: 16px; }
}
</style>
