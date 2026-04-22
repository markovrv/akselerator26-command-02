<template>
  <div class="vacancy-details-view">
    <div class="vacancy-container">
      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем вакансию...</p>
      </div>

      <template v-else-if="vacancy">
        <!-- Header -->
        <div class="vacancy-header">
          <div>
            <p class="vacancy-enterprise">{{ vacancy.enterpriseName }}</p>
            <h1>{{ vacancy.title }}</h1>
            <div class="vacancy-tags">
              <span class="tag">📍 {{ vacancy.city }}</span>
              <span class="tag tag-salary">
                {{ vacancy.salary_min ? vacancy.salary_min.toLocaleString('ru-RU') : '—' }}
                {{ vacancy.salary_max ? '– ' + vacancy.salary_max.toLocaleString('ru-RU') : '' }} ₽
              </span>
            </div>
          </div>
          <router-link :to="`/enterprises/${vacancy.enterpriseId}`" class="btn btn-outline">
            ← К предприятию
          </router-link>
        </div>

        <!-- Description -->
        <section class="content-card">
          <h2>Описание</h2>
          <p class="content-text">{{ vacancy.description }}</p>
          <h3>Требования</h3>
          <p class="content-text">{{ vacancy.requirements || 'Не указаны' }}</p>
        </section>

        <!-- Tabs -->
        <div class="tabs-wrapper">
          <div class="tabs-nav">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <div v-if="activeTab === 'instructions'" class="tab-pane">
              <h2>Должностная инструкция</h2>
              <pre class="content-text pre-text">{{ vacancy.job_instructions || 'Инструкция не указана' }}</pre>
            </div>

            <div v-if="activeTab === 'salary'" class="tab-pane">
              <h2>Порядок расчета заработной платы</h2>
              <p class="content-text">{{ vacancy.salary_calculation || 'Информация не указана' }}</p>
            </div>

            <div v-if="activeTab === 'agreement'" class="tab-pane">
              <h2>Коллективный договор</h2>
              <a v-if="vacancy.collective_agreement_url" :href="vacancy.collective_agreement_url" target="_blank" class="doc-link">
                📄 Скачать коллективный договор (PDF)
              </a>
              <p v-else class="empty-hint">Коллективный договор не приложен</p>
            </div>

            <div v-if="activeTab === '3d'" class="tab-pane">
              <h2>3D-модель рабочего места</h2>
              <Viewer3D v-if="vacancy.three_d_model_url" :modelUrl="vacancy.three_d_model_url" />
              <p v-else class="empty-hint">3D-модель не приложена</p>
            </div>
          </div>
        </div>

        <!-- Excursions section -->
        <section class="excursions-section">
          <h2>🚌 Экскурсии на предприятие</h2>
          <p class="excursions-subtitle">Запишись на экскурсию, чтобы увидеть рабочее место изнутри</p>

          <div v-if="excursionsLoading" class="exc-loading">
            <div class="spinner-sm"></div>
            <span>Загружаем экскурсии...</span>
          </div>

          <div v-else-if="enterpriseExcursions.length" class="excursions-list">
            <div
              v-for="exc in enterpriseExcursions"
              :key="exc.id"
              class="exc-card"
            >
              <div class="exc-card-top">
                <span class="exc-badge" :class="exc.excursionType || exc.type">
                  {{ (exc.excursionType || exc.type) === 'online' ? '📡 Онлайн' : '📍 Офлайн' }}
                </span>
                <span class="exc-slots" v-if="exc.availableSlots !== undefined">
                  👥 {{ exc.availableSlots }} мест
                </span>
              </div>
              <h3>{{ exc.title }}</h3>
              <p class="exc-desc">{{ exc.description }}</p>
              <div class="exc-details">
                <div class="exc-detail">
                  <span>📅</span>
                  <span>{{ formatDate(exc.date_time) }}</span>
                </div>
                <div class="exc-detail" v-if="exc.address">
                  <span>🏢</span>
                  <span>{{ exc.address }}</span>
                </div>
              </div>
              <button
                v-if="exc.isUserRegistered"
                @click="unregisterFromExcursion(exc.id)"
                class="btn btn-outline btn-full"
              >
                ✕ Отписаться
              </button>
              <button
                v-else
                @click="registerForExcursion(exc.id)"
                :disabled="exc.availableSlots === 0"
                class="btn btn-primary btn-full"
              >
                {{ exc.available_slots === 0 ? 'Мест нет' : 'Записаться' }}
              </button>
            </div>
          </div>

          <p v-else class="empty-hint">Доступных экскурсий пока нет</p>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'
import Viewer3D from '@/components/Viewer3D.vue'

const route = useRoute()

const loading = ref(true)
const vacancy = ref<any>(null)
const activeTab = ref('instructions')
const enterpriseExcursions = ref<any[]>([])
const excursionsLoading = ref(false)

const tabs = [
  { id: 'instructions', label: 'Должностная инструкция' },
  { id: 'salary', label: 'Расчет ЗП' },
  { id: 'agreement', label: 'Коллективный договор' },
  { id: '3d', label: '3D-модель' }
]

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function registerForExcursion(excursionId: number) {
  try {
    const response = await api.post(`/excursions/${excursionId}/register`)
    if (response.data.success) {
      alert('Вы успешно записались на экскурсию!')
      loadEnterpriseExcursions()
    }
  } catch (error: any) {
    alert(error?.response?.data?.error?.message || 'Ошибка при записи')
  }
}

async function unregisterFromExcursion(excursionId: number) {
  if (!confirm('Отписаться от экскурсии?')) return
  try {
    const response = await api.delete(`/excursions/${excursionId}/register`)
    if (response.data.success) {
      alert('Вы отписались от экскурсии.')
      loadEnterpriseExcursions()
    }
  } catch (error: any) {
    alert(error?.response?.data?.error?.message || 'Ошибка при отписке')
  }
}

async function loadEnterpriseExcursions() {
  if (!vacancy.value?.enterprise_id) return
  excursionsLoading.value = true
  try {
    const [excRes, myRes] = await Promise.all([
      api.get('/excursions'),
      api.get('/excursions/my').catch(() => ({ data: { data: { registrations: [] } } }))
    ])

    const myIds = new Set((myRes.data.data.registrations || []).map((r: any) => r.excursion_id))

    if (excRes.data.success) {
      enterpriseExcursions.value = excRes.data.data.excursions
        .filter((e: any) => e.enterprise_id === vacancy.value.enterprise_id && (e.isActive !== false))
        .map((e: any) => ({ ...e, isUserRegistered: myIds.has(e.id) }))
    }
  } catch (e) {
    console.error('Failed to load enterprise excursions:', e)
  } finally {
    excursionsLoading.value = false
  }
}

async function loadVacancy() {
  try {
    const id = route.params.id
    const response = await api.get(`/vacancies/${id}`)
    if (response.data.success) {
      vacancy.value = response.data.data.vacancy
      // Загружаем экскурсии этого предприятия
      loadEnterpriseExcursions()
    }
  } catch (error) {
    console.error('Failed to load vacancy:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadVacancy)
</script>

<style scoped lang="scss">
.vacancy-details-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.vacancy-container {
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

.vacancy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  .vacancy-enterprise {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 4px;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 12px;
  }
}

.vacancy-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  color: #475569;

  &-salary {
    background: #dbeafe;
    color: #2563eb;
    font-weight: 600;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &-outline {
    background: transparent;
    color: #475569;
    border: 1.5px solid #e2e8f0;
    &:hover { background: #f8fafc; border-color: #cbd5e1; }
  }

  &-primary {
    background: #2563eb;
    color: white;

    &:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &-full {
    width: 100%;
  }
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

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin: 24px 0 12px;
  }

  .content-text {
    font-size: 0.938rem;
    color: #475569;
    line-height: 1.7;
  }
}

.tabs-wrapper {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-btn {
  padding: 14px 20px;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;

  &:hover {
    color: #0f172a;
    background: #f8fafc;
  }

  &.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
}

.tab-content {
  padding: 32px;
}

.tab-pane {
  h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 16px;
  }

  .content-text {
    font-size: 0.938rem;
    color: #475569;
    line-height: 1.7;
  }

  .pre-text {
    white-space: pre-wrap;
    font-family: inherit;
  }
}

.doc-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f1f5f9;
  border-radius: 8px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.938rem;
  transition: background 0.15s ease;

  &:hover {
    background: #e2e8f0;
  }
}

.empty-hint {
  color: #94a3b8;
  font-style: italic;
}

.excursions-section {
  margin-top: 32px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .excursions-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 24px;
  }
}

.exc-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: #94a3b8;
  font-size: 0.875rem;
}

.spinner-sm {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.excursions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.exc-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  h3 {
    font-size: 0.938rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
  }
}

.exc-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exc-badge {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.688rem;
  font-weight: 600;

  &.online {
    background: #dbeafe;
    color: #2563eb;
  }

  &.offline {
    background: #dcfce7;
    color: #166534;
  }
}

.exc-slots {
  font-size: 0.75rem;
  color: #94a3b8;
}

.exc-desc {
  font-size: 0.813rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.exc-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.exc-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #64748b;
}

.btn-full {
  width: 100%;
}
</style>
