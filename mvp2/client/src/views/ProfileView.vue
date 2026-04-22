<template>
  <div class="profile-view">
    <div class="profile-container">
      <!-- Header -->
      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем профиль...</p>
      </div>

      <template v-else-if="authStore.user">
        <div class="profile-header">
          <div class="profile-avatar-lg">
            {{ authStore.user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-info">
            <h1>{{ authStore.user.name }}</h1>
            <p class="profile-email">{{ authStore.user.email }}</p>
            <VaBadge :text="roleText(authStore.user.role)" :color="roleColor(authStore.user.role)" />
          </div>
        </div>

        <!-- Digital Passport -->
        <div class="passport-section">
          <div class="section-header">
            <h2>📊 Мои рекомендации</h2>
            <router-link to="/test" class="btn btn-sm btn-outline" v-if="!testResults.length">
              Пройти тест
            </router-link>
          </div>

          <!-- Test results summary -->
          <div v-if="testResults.length" class="test-summary">
            <p>Пройдено тестов: <strong>{{ testResults.length }}</strong> · Последний: {{ formatDate(testResults[testResults.length - 1].completedAt) }}</p>
          </div>

          <!-- Recommended vacancies -->
          <div v-if="recommendedVacancies.length" class="recommendations-grid">
            <div
              v-for="vacancy in recommendedVacancies"
              :key="vacancy.vacancy_id"
              class="rec-card"
            >
              <div class="rec-card-header">
                <div class="rec-score" :class="scoreClass(vacancy.matchScore)">
                  {{ vacancy.matchScore }}%
                </div>
                <span class="rec-type" v-if="!vacancy.isActive">Неактивна</span>
              </div>
              <h3 @click="goToVacancy(vacancy.vacancyId)">{{ vacancy.title }}</h3>
              <p class="rec-enterprise">{{ vacancy.enterpriseName }}</p>
              <p class="rec-reason" v-if="vacancy.reason">{{ vacancy.reason }}</p>
              <div class="rec-meta">
                <span>📍 {{ vacancy.city }}</span>
                <span class="rec-salary">
                  {{ vacancy.salaryMin ? vacancy.salaryMin.toLocaleString('ru-RU') : '—' }}
                  {{ vacancy.salaryMax ? '– ' + vacancy.salaryMax.toLocaleString('ru-RU') : '' }} ₽
                </span>
              </div>
              <router-link :to="`/vacancies/${vacancy.vacancyId}`" class="btn btn-sm btn-primary">
                Подробнее
              </router-link>
            </div>
          </div>

          <div v-else-if="testResults.length" class="empty-state">
            <span>🔍</span>
            <p>Рекомендации не найдены. Попробуй изменить ответы или обратись к администратору.</p>
          </div>

          <div v-else class="empty-state">
            <span>🧠</span>
            <p>Ты ещё не проходил тест. Пройди его, чтобы получить персональные рекомендации!</p>
            <router-link to="/test" class="btn btn-primary">Пройти тест</router-link>
          </div>
        </div>

        <!-- Excursion registrations -->
        <div class="passport-section" v-if="myExcursions.length">
          <h2>🚌 Мои записи на экскурсии</h2>
          <div class="excursions-list">
            <div v-for="reg in myExcursions" :key="reg.id" class="excursion-item">
              <div>
                <h4>{{ reg.excursionTitle }}</h4>
                <p class="exc-meta">{{ reg.enterpriseName }} · {{ formatDate(reg.excursionDateTime || reg.registeredAt) }}</p>
              </div>
              <div class="excursion-actions">
                <VaBadge :text="statusText(reg.status)" :color="statusColor(reg.status)" />
                <button @click="downloadReferral(reg.id)" class="btn-download">
                  📄 Скачать направление
                </button>
                <button @click="unregister(reg.id, reg.excursion_id)" class="btn-unregister">
                  ✕ Отписаться
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const testResults = ref<any[]>([])
const recommendedVacancies = ref<any[]>([])
const myExcursions = ref<any[]>([])

function roleText(role: string) {
  const m: Record<string, string> = { seeker: 'Соискатель', student: 'Студент', admin: 'Администратор' }
  return m[role] || role
}

function roleColor(role: string) {
  const m: Record<string, string> = { seeker: 'info', student: 'success', admin: 'danger' }
  return m[role] || 'secondary'
}

function scoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusText(s: string) {
  const m: Record<string, string> = { pending: 'На рассмотрении', confirmed: 'Подтверждено', cancelled: 'Отменено', completed: 'Завершено' }
  return m[s] || s
}

function statusColor(s: string) {
  const m: Record<string, string> = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' }
  return m[s] || 'secondary'
}

function goToVacancy(id: number) {
  router.push(`/vacancies/${id}`)
}

async function unregister(registrationId: number, excursionId: number) {
  if (!confirm('Отписаться от экскурсии?')) return
  try {
    await api.delete(`/excursions/${excursionId}/register`)
    myExcursions.value = myExcursions.value.filter(r => r.id !== registrationId)
  } catch (error: any) {
    alert(error?.response?.data?.error?.message || 'Ошибка при отписке')
  }
}

async function downloadReferral(registrationId: number) {
  try {
    const response = await api.get(`/excursions/registrations/${registrationId}/referral`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `направление-${registrationId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    alert(error?.response?.data?.error?.message || 'Ошибка при скачивании направления')
  }
}

async function loadProfile() {
  try {
    await authStore.fetchProfile()
    const res = await api.get('/tests/results')
    if (res.data.success) {
      testResults.value = (res.data.data.testResults || []).map((tr: any) => ({
        testId: tr.id,
        completedAt: tr.completedAt,
        answersCount: tr.answersCount
      }))
      recommendedVacancies.value = res.data.data.recommendedVacancies || []
    }
    const excRes = await api.get('/excursions/my')
    if (excRes.data.success) {
      myExcursions.value = excRes.data.data.registrations || []
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped lang="scss">
.profile-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.profile-container {
  max-width: 960px;
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

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 32px;
}

.profile-avatar-lg {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info {
  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .profile-email {
    font-size: 0.938rem;
    color: #64748b;
    margin-bottom: 8px;
  }
}

.passport-section {
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 20px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.test-summary {
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #475569;
  margin-bottom: 20px;
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

  &-sm { padding: 6px 14px; font-size: 0.813rem; }

  &-primary {
    background: #2563eb;
    color: white;
    &:hover { background: #1d4ed8; }
  }

  &-outline {
    background: transparent;
    color: #475569;
    border: 1.5px solid #e2e8f0;
    &:hover { background: #f8fafc; border-color: #cbd5e1; }
  }
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.rec-card {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 6px;
    cursor: pointer;

    &:hover { color: #2563eb; }
  }
}

.rec-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rec-score {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 700;

  &.high { background: #dcfce7; color: #166534; }
  &.medium { background: #fef3c7; color: #92400e; }
  &.low { background: #fee2e2; color: #991b1b; }
}

.rec-type {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 4px;
}

.rec-enterprise {
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 8px;
}

.rec-reason {
  font-size: 0.813rem;
  color: #2563eb;
  font-style: italic;
  margin-bottom: 12px;
  line-height: 1.5;
}

.rec-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.813rem;
  color: #94a3b8;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.rec-salary {
  font-weight: 600;
  color: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;

  span { font-size: 3rem; display: block; margin-bottom: 16px; }

  p {
    color: #64748b;
    margin-bottom: 20px;
  }
}

.excursions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.excursion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  gap: 12px;
  flex-wrap: wrap;

  h4 {
    font-size: 0.938rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .exc-meta {
    font-size: 0.813rem;
    color: #94a3b8;
  }
}

.excursion-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-download {
  padding: 6px 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
}

.btn-unregister {
  padding: 6px 14px;
  background: transparent;
  color: #94a3b8;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
  }
}
</style>
