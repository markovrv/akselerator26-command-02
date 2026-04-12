<template>
  <div>
    <h2>Пользователи и цифровые паспорта</h2>

    <VaDataTable
      :items="users"
      :columns="columns"
      :loading="loading"
      hoverable
    >
      <template #cell(role)="{ rowData }">
        <VaBadge :text="roleLabel(rowData.role)" :color="roleColor(rowData.role)" />
      </template>
      <template #cell(isActive)="{ rowData }">
        <VaBadge :text="rowData.isActive ? 'Активен' : 'Заблокирован'" :color="rowData.isActive ? 'success' : 'danger'" />
      </template>
      <template #cell(actions)="{ rowData }">
        <VaButton preset="primary" size="small" @click.stop="openPassport(rowData)">🛂 Паспорт</VaButton>
        <VaButton
          preset="primary" size="small"
          :color="rowData.isActive ? 'warning' : 'success'"
          @click.stop="toggleActive(rowData.id, !rowData.isActive)"
        >
          {{ rowData.isActive ? '⛔' : '✅' }}
        </VaButton>
      </template>
    </VaDataTable>

    <!-- ===== Модалка цифрового паспорта ===== -->
    <VaModal
      v-model="showPassport"
      :title="`Цифровой паспорт: ${selectedUser?.name} (${selectedUser?.email})`"
      cancel-text="Закрыть"
      :ok-text="''"
      :close-on-backdrop="false"
      max-width="900px"
    >
      <div v-if="passport" class="passport-content">
        <!-- Результаты тестов -->
        <h4>📝 Результаты тестов ({{ passport.testResults.length }})</h4>
        <VaDataTable
          :items="passport.testResults"
          :columns="testColumns"
          :loading="false"
          size="small"
        >
          <template #cell(actions)="{ rowData }">
            <VaButton preset="primary" size="small" color="danger" @click="deleteTestResult(rowData.testId)">🗑️</VaButton>
          </template>
        </VaDataTable>

        <!-- Рекомендованные вакансии -->
        <h4 class="mt-6">💼 Рекомендованные вакансии ({{ passport.recommendedVacancies.length }})</h4>

        <!-- Добавить рекомендацию -->
        <div class="add-rec">
          <VaSelect
            v-model="addRecForm.vacancy_id"
            :options="vacancyOptions"
            label="Добавить вакансию"
            value-by="value"
            text-by="label"
            clearable
            size="small"
          />
          <VaInput
            v-model.number="addRecForm.match_score"
            label="Score (0-100)"
            type="number"
            size="small"
          />
          <VaButton size="small" @click="addRecommendation" :disabled="!addRecForm.vacancy_id">
            ➕ Добавить
          </VaButton>
        </div>

        <VaDataTable
          :items="passport.recommendedVacancies"
          :columns="recColumns"
          :loading="false"
          size="small"
        >
          <template #cell(match_score)="{ rowData }">
            <VaBadge :text="`${rowData.match_score}%`" :color="scoreColor(rowData.match_score)" />
          </template>
          <template #cell(actions)="{ rowData }">
            <VaButton preset="primary" size="small" color="danger" @click="deleteRecommendation(rowData.vacancy_id)">🗑️</VaButton>
          </template>
        </VaDataTable>

        <!-- Записи на экскурсии -->
        <h4 class="mt-6">🚌 Записи на экскурсии ({{ passport.excursionRegistrations.length }})</h4>
        <p v-if="!passport.excursionRegistrations.length" class="empty">Нет записей</p>
        <ul v-else>
          <li v-for="regId in passport.excursionRegistrations" :key="regId">
            Запись #{{ regId }}
          </li>
        </ul>

        <!-- Очистить паспорт -->
        <div class="mt-6">
          <VaButton color="danger" @click="clearPassport">🧹 Очистить весь паспорт</VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface UserSummary {
  id: number
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  testResultsCount: number
  recommendedVacanciesCount: number
  excursionRegistrationsCount: number
}

interface PassportData {
  testResults: any[]
  recommendedVacancies: any[]
  excursionRegistrations: number[]
}

const users = ref<UserSummary[]>([])
const loading = ref(false)
const showPassport = ref(false)
const selectedUser = ref<UserSummary | null>(null)
const passport = ref<PassportData | null>(null)

// Add recommendation form
const addRecForm = ref({
  vacancy_id: null as number | null,
  match_score: 80
})
const vacancyOptions = ref<{ label: string; value: number }[]>([])

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: 'Имя' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Роль', width: '120px' },
  { key: 'isActive', label: 'Статус', width: '120px' },
  { key: 'testResultsCount', label: 'Тесты', width: '80px' },
  { key: 'recommendedVacanciesCount', label: 'Рекомендации', width: '130px' },
  { key: 'actions', label: '', width: '200px' }
]

const testColumns = [
  { key: 'testId', label: 'ID теста', width: '100px' },
  { key: 'completedAt', label: 'Дата', width: '180px' },
  { key: 'answersCount', label: 'Ответов', width: '80px' },
  { key: 'actions', label: '', width: '80px' }
]

const recColumns = [
  { key: 'vacancy_id', label: 'ID', width: '60px' },
  { key: 'title', label: 'Вакансия' },
  { key: 'enterpriseName', label: 'Предприятие', width: '160px' },
  { key: 'match_score', label: 'Совпадение', width: '120px' },
  { key: 'reason', label: 'Причина' },
  { key: 'actions', label: '', width: '80px' }
]

function roleLabel(role: string) {
  const map: Record<string, string> = { seeker: 'Соискатель', student: 'Студент', admin: 'Админ' }
  return map[role] || role
}

function roleColor(role: string) {
  const map: Record<string, string> = { seeker: 'info', student: 'success', admin: 'danger' }
  return map[role] || 'secondary'
}

function scoreColor(score: number) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'danger'
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await api.get('/admin/users')
    users.value = res.data.data.users
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadVacancyOptions() {
  try {
    const res = await api.get('/vacancies')
    vacancyOptions.value = res.data.data.vacancies.map((v: any) => ({
      label: `${v.title} (${v.enterpriseName})`,
      value: v.id
    }))
  } catch (e) {
    console.error(e)
  }
}

async function openPassport(user: UserSummary) {
  selectedUser.value = user
  try {
    const res = await api.get(`/admin/users/${user.id}`)
    passport.value = res.data.data.user.digitalPassport
    showPassport.value = true
  } catch (e) {
    alert('Ошибка загрузки паспорта')
  }
}

async function toggleActive(id: number, _active: boolean) {
  try {
    await api.put(`/admin/users/${id}/toggle-active`)
    loadUsers()
  } catch (e) {
    alert('Ошибка изменения статуса')
  }
}

async function deleteTestResult(testId: number) {
  if (!confirm('Удалить результат теста?')) return
  try {
    await api.delete(`/admin/users/${selectedUser.value!.id}/passport/test-results/${testId}`)
    openPassport(selectedUser.value!)
    loadUsers()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка удаления')
  }
}

async function deleteRecommendation(vacancy_id: number) {
  if (!confirm('Удалить рекомендацию?')) return
  try {
    await api.delete(`/admin/users/${selectedUser.value!.id}/passport/recommendations/${vacancy_id}`)
    openPassport(selectedUser.value!)
    loadUsers()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка удаления')
  }
}

async function addRecommendation() {
  if (!addRecForm.value.vacancy_id || !selectedUser.value) return
  try {
    await api.post(`/admin/users/${selectedUser.value.id}/passport/recommendations`, {
      vacancyId: addRecForm.value.vacancy_id,
      match_score: addRecForm.value.match_score,
      reason: 'Добавлено администратором'
    })
    addRecForm.value.vacancy_id = null
    openPassport(selectedUser.value)
    loadUsers()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка добавления')
  }
}

async function clearPassport() {
  if (!confirm('Очистить весь цифровой паспорт? Это действие необратимо.')) return
  try {
    await api.delete(`/admin/users/${selectedUser.value!.id}/passport`)
    openPassport(selectedUser.value!)
    loadUsers()
  } catch (e) {
    alert('Ошибка очистки паспорта')
  }
}

onMounted(() => {
  loadUsers()
  loadVacancyOptions()
})
</script>

<style scoped>
.mt-6 { margin-top: 24px; }

.add-rec {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.passport-content h4 {
  margin-bottom: 12px;
  color: #333;
}

.empty {
  color: #999;
  font-style: italic;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 4px;
}
</style>
