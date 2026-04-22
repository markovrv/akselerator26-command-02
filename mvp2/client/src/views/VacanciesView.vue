<template>
  <div class="vacancies-view">
    <div class="page-container">
      <div class="page-header">
        <h1>Вакансии</h1>
        <p class="page-subtitle">Все доступные вакансии промышленных предприятий</p>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск по названию или предприятию..."
          class="search-input"
        />
        <select v-model="selectedCity" class="filter-select">
          <option value="">Все города</option>
          <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>

      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем вакансии...</p>
      </div>

      <div v-else class="vacancies-grid">
        <router-link
          v-for="vacancy in filteredVacancies"
          :key="vacancy.id"
          :to="`/vacancies/${vacancy.id}`"
          class="vacancy-card"
        >
          <div class="vac-card-header">
            <h3>{{ vacancy.title }}</h3>
            <span class="vac-salary-tag" v-if="vacancy.salary_min || vacancy.salary_max">
              {{ vacancy.salary_min ? vacancy.salary_min.toLocaleString('ru-RU') : '—' }}
              {{ vacancy.salary_max ? '– ' + vacancy.salary_max.toLocaleString('ru-RU') : '' }} ₽
            </span>
          </div>
          <p class="vac-enterprise">{{ vacancy.enterpriseName }}</p>
          <p class="vac-desc">{{ vacancy.description }}</p>
          <div class="vac-meta">
            <span>📍 {{ vacancy.city }}</span>
            <span class="vac-req" v-if="vacancy.requirements">{{ vacancy.requirements.slice(0, 60) }}...</span>
          </div>
        </router-link>
      </div>

      <div v-if="!loading && !filteredVacancies.length" class="empty-state">
        <span>🔍</span>
        <p>Вакансии не найдены</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const vacancies = ref<any[]>([])
const searchQuery = ref('')
const selectedCity = ref('')

const cities = computed(() => {
  return [...new Set(vacancies.value.map(v => v.city))].sort()
})

const filteredVacancies = computed(() => {
  return vacancies.value.filter(v => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || v.title.toLowerCase().includes(q) || v.enterpriseName.toLowerCase().includes(q)
    const matchesCity = !selectedCity.value || v.city === selectedCity.value
    return matchesSearch && matchesCity
  })
})

async function loadVacancies() {
  try {
    const response = await api.get('/vacancies')
    if (response.data.success) {
      vacancies.value = response.data.data.vacancies
    }
  } catch (error) {
    console.error('Failed to load vacancies:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadVacancies)
</script>

<style scoped lang="scss">
.vacancies-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .page-subtitle {
    font-size: 1.063rem;
    color: #64748b;
  }
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 10px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.938rem;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

.filter-select {
  padding: 10px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.938rem;
  font-family: inherit;
  background: white;
  min-width: 180px;
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

.vacancies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.vacancy-card {
  display: block;
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

.vac-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #2563eb;
  }
}

.vac-salary-tag {
  padding: 3px 10px;
  background: #dbeafe;
  color: #2563eb;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.vac-enterprise {
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 10px;
}

.vac-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vac-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.vac-req {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;

  span { font-size: 3rem; display: block; margin-bottom: 16px; }
  p { color: #94a3b8; }
}
</style>
