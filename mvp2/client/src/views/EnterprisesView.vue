<template>
  <div class="enterprises-view">
    <div class="page-container">
      <div class="page-header">
        <h1>Предприятия</h1>
        <p class="page-subtitle">Каталог промышленных предприятий с вакансиями и контактами</p>
      </div>

      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем предприятия...</p>
      </div>

      <div v-else class="enterprises-grid">
        <router-link
          v-for="enterprise in enterprises"
          :key="enterprise.id"
          :to="`/enterprises/${enterprise.id}`"
          class="enterprise-card"
        >
          <div class="card-logo">
            <img
              v-if="enterprise.logo_url"
              :src="enterprise.logo_url"
              :alt="enterprise.name"
              class="logo-img"
            />
            <span v-else class="logo-placeholder">🏭</span>
          </div>
          <div class="card-content">
            <h3>{{ enterprise.name }}</h3>
            <p class="card-desc">{{ enterprise.description }}</p>
            <div class="card-meta">
              <span>📍 {{ enterprise.city }}</span>
              <span class="card-vacancies">{{ enterprise.vacanciesCount }} вакансий</span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="!loading && !enterprises.length" class="empty-state">
        <span>🏭</span>
        <p>Предприятий пока нет</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const enterprises = ref<any[]>([])

async function loadEnterprises() {
  try {
    const response = await api.get('/enterprises')
    if (response.data.success) {
      enterprises.value = response.data.data.enterprises
    }
  } catch (error) {
    console.error('Failed to load enterprises:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadEnterprises)
</script>

<style scoped lang="scss">
.enterprises-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 1.063rem;
    color: #64748b;
  }
}

.page-loading {
  text-align: center;
  padding: 80px 24px;

  p { color: #94a3b8; margin-top: 16px; }
}

.spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin { to { transform: rotate(360deg); } }

.enterprises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.enterprise-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
    border-color: #bfdbfe;
  }
}

.card-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .logo-placeholder {
    font-size: 1.75rem;
  }
}

.card-content {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 1.063rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }
}

.card-desc {
  font-size: 0.813rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
  color: #94a3b8;
}

.card-vacancies {
  color: #2563eb;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;

  span { font-size: 3rem; display: block; margin-bottom: 16px; }
  p { color: #94a3b8; }
}
</style>
