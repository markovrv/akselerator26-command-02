<template>
  <div class="enterprise-details-view">
    <div class="page-container">
      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем...</p>
      </div>

      <template v-else-if="enterprise">
        <!-- Header -->
        <div class="ent-header">
          <div class="ent-logo">
            <img v-if="enterprise.logo_url" :src="enterprise.logo_url" :alt="enterprise.name" />
            <span v-else>🏭</span>
          </div>
          <div class="ent-info">
            <h1>{{ enterprise.name }}</h1>
            <p class="ent-city">📍 {{ enterprise.city }}</p>
            <div class="ent-contacts">
              <a v-if="enterprise.contact_email" :href="`mailto:${enterprise.contact_email}`">📧 {{ enterprise.contact_email }}</a>
              <a v-if="enterprise.contact_phone" :href="`tel:${enterprise.contact_phone}`">📞 {{ enterprise.contact_phone }}</a>
              <a v-if="enterprise.website" :href="enterprise.website" target="_blank">🌐 Сайт</a>
            </div>
          </div>
          <router-link to="/enterprises" class="btn btn-outline">← Назад</router-link>
        </div>

        <!-- Description -->
        <section class="content-card">
          <h2>О предприятии</h2>
          <p class="content-text">{{ enterprise.description }}</p>
          <p v-if="enterprise.address" class="content-text"><strong>Адрес:</strong> {{ enterprise.address }}</p>
        </section>

        <!-- Vacancies -->
        <section class="content-card">
          <h2>Вакансии предприятия ({{ enterprise.vacancies?.length || 0 }})</h2>
          <div v-if="enterprise.vacancies?.length" class="ent-vacancies">
            <router-link
              v-for="vacancy in enterprise.vacancies"
              :key="vacancy.id"
              :to="`/vacancies/${vacancy.id}`"
              class="ent-vacancy-item"
            >
              <div>
                <h4>{{ vacancy.title }}</h4>
                <p class="ent-vac-salary" v-if="vacancy.salary_min || vacancy.salary_max">
                  {{ vacancy.salary_min ? vacancy.salary_min.toLocaleString('ru-RU') : '—' }}
                  {{ vacancy.salary_max ? '– ' + vacancy.salary_max.toLocaleString('ru-RU') : '' }} ₽
                </p>
              </div>
              <span class="arrow">→</span>
            </router-link>
          </div>
          <p v-else class="empty-hint">Вакансий пока нет</p>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const loading = ref(true)
const enterprise = ref<any>(null)

async function loadEnterprise() {
  try {
    const id = route.params.id
    const response = await api.get(`/enterprises/${id}`)
    if (response.data.success) {
      enterprise.value = response.data.data.enterprise
    }
  } catch (error) {
    console.error('Failed to load enterprise:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadEnterprise)
</script>

<style scoped lang="scss">
.enterprise-details-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
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

.ent-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 32px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  .ent-logo {
    width: 96px;
    height: 96px;
    border-radius: 16px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

.ent-info {
  flex: 1;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .ent-city {
    font-size: 0.938rem;
    color: #64748b;
    margin-bottom: 12px;
  }
}

.ent-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  a {
    font-size: 0.813rem;
    color: #2563eb;
    text-decoration: none;

    &:hover { text-decoration: underline; }
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 600;
  text-decoration: none;
  border: 1.5px solid #e2e8f0;
  color: #475569;
  background: transparent;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover { background: #f8fafc; border-color: #cbd5e1; }
}

.content-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
  }

  .content-text {
    font-size: 0.938rem;
    color: #475569;
    line-height: 1.7;
    margin-bottom: 12px;
  }
}

.ent-vacancies {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ent-vacancy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;

  &:hover {
    background: #eff6ff;

    .arrow {
      transform: translateX(4px);
      color: #2563eb;
    }
  }

  h4 {
    font-size: 0.938rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
  }
}

.ent-vac-salary {
  font-size: 0.813rem;
  color: #2563eb;
  font-weight: 600;
}

.arrow {
  font-size: 1.25rem;
  color: #94a3b8;
  transition: all 0.15s ease;
}

.empty-hint {
  color: #94a3b8;
  font-style: italic;
}
</style>
