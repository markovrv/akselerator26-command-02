<template>
  <div>
    <VaTabs v-model="activeTab" color="primary">
      <template #tabs>
        <VaTab name="excursions">🚌 Экскурсии</VaTab>
        <VaTab name="registrations">📋 Заявки</VaTab>
      </template>
    </VaTabs>

    <!-- ===== Эккурсии ===== -->
    <div v-if="activeTab === 'excursions'">
      <div class="section-header">
        <h3>Список экскурсий</h3>
        <VaButton icon="add" @click="openExcursionModal()">Добавить</VaButton>
      </div>

      <VaDataTable
        :items="excursions"
        :columns="excursionColumns"
        :loading="loading"
        hoverable
      >
        <template #cell(dateTime)="{ rowData }">
          {{ formatDate(rowData.date_time) }}
        </template>
        <template #cell(excursionType)="{ rowData }">
          <VaBadge :color="rowData.excursion_type === 'online' ? 'info' : 'success'"
                   :text="rowData.excursion_type === 'online' ? 'Онлайн' : 'Офлайн'" />
        </template>
        <template #cell(actions)="{ rowData }">
          <VaButton preset="primary" size="small" @click.stop="openExcursionModal(rowData)">✏️</VaButton>
          <VaButton preset="primary" size="small" color="danger" @click.stop="deleteExcursion(rowData.id)">🗑️</VaButton>
        </template>
      </VaDataTable>

      <!-- Modal -->
      <VaModal
        v-model="showExcursionModal"
        :title="isExcursionEdit ? 'Редактировать экскурсию' : 'Новая экскурсия'"
        ok-text="Сохранить"
        cancel-text="Отмена"
        @ok="saveExcursion"
      >
        <VaForm>
          <VaSelect
            v-model="excursionForm.enterprise_id"
            :options="enterpriseOptions"
            label="Предприятие *"
            value-by="value"
            text-by="label"
            class="mb-4"
          />
          <VaInput
            v-model="excursionForm.title"
            label="Название *"
            class="mb-4"
          />
          <VaTextarea
            v-model="excursionForm.description"
            label="Описание"
            class="mb-4"
          />
          <VaInput
            v-model="excursionForm.date_time"
            label="Дата и время (ISO) *"
            placeholder="2026-05-01T14:00:00.000Z"
            class="mb-4"
          />
          <VaSelect
            v-model="excursionForm.excursion_type"
            :options="['offline', 'online']"
            label="Тип *"
            class="mb-4"
          />
          <VaInput
            v-model="excursionForm.address"
            label="Адрес (для офлайн)"
            class="mb-4"
          />
          <VaInput
            v-model="excursionForm.stream_url"
            label="URL трансляции (для онлайн)"
            class="mb-4"
          />
          <VaInput
            v-model.number="excursionForm.max_participants"
            label="Кол-во мест"
            type="number"
            class="mb-4"
          />
          <VaInput
            v-model="excursionForm.registration_deadline"
            label="Дедлайн записи (ISO)"
            placeholder="2026-04-30T23:59:59.000Z"
            class="mb-4"
          />
        </VaForm>
      </VaModal>
    </div>

    <!-- ===== Заявки ===== -->
    <div v-if="activeTab === 'registrations'">
      <VaDataTable
        :items="registrations"
        :columns="registrationColumns"
        :loading="loading"
        hoverable
      >
        <template #cell(status)="{ rowData }">
          <VaBadge :color="statusColor(rowData.status)" :text="statusLabel(rowData.status)" />
        </template>
        <template #cell(excursionDateTime)="{ rowData }">
          {{ formatDate(rowData.excursion_date_time) }}
        </template>
        <template #cell(actions)="{ rowData }">
          <VaSelect
            v-model="rowData.status"
            :options="statusOptions"
            size="small"
            @update:model-value="updateStatus(rowData.id, $event)"
          />
        </template>
      </VaDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface Excursion {
  id: number
  enterprise_id: number
  enterpriseName: string
  title: string
  description: string
  date_time: string
  excursion_type: 'online' | 'offline'
  address: string
  stream_url: string
  max_participants: number
  available_slots: number
  registration_deadline: string
  is_active: boolean
}

interface Registration {
  id: number
  user_id: number
  excursion_id: number
  excursion_ditle: string
  enterpriseName: string
  excursion_date_time: string
  excursion_type: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  medical_referral_url: string
  registered_at: string
}

const excursions = ref<Excursion[]>([])
const registrations = ref<Registration[]>([])
const enterprises = ref<any[]>([])
const enterpriseOptions = ref<{ label: string; value: number }[]>([])
const loading = ref(false)
const activeTab = ref('excursions')

// Excursion form
const showExcursionModal = ref(false)
const isExcursionEdit = ref(false)
const editingExcursionId = ref<number | null>(null)
const excursionForm = ref({
  enterprise_id: null as number | null,
  title: '',
  description: '',
  date_time: '',
  excursion_type: 'offline' as 'online' | 'offline',
  address: '',
  stream_url: '',
  max_participants: 20,
  registration_deadline: ''
})

const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed']

const excursionColumns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'title', label: 'Название' },
  { key: 'enterpriseName', label: 'Предприятие' },
  { key: 'date_time', label: 'Дата', width: '160px' },
  { key: 'excursion_type', label: 'Тип', width: '90px' },
  { key: 'available_slots', label: 'Места', width: '80px' },
  { key: 'actions', label: '', width: '100px' }
]

const registrationColumns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'enterpriseName', label: 'Предприятие' },
  { key: 'excursion_title', label: 'Экскурсия' },
  { key: 'excursion_date_time', label: 'Дата', width: '160px' },
  { key: 'excursion_type', label: 'Тип', width: '80px' },
  { key: 'status', label: 'Статус', width: '140px' },
  { key: 'registered_at', label: 'Запись', width: '160px' },
  { key: 'actions', label: 'Изменить статус', width: '180px' }
]

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'info'
  }
  return map[status] || 'secondary'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'На рассмотрении',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  }
  return map[status] || status
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function loadEnterprises() {
  try {
    const res = await api.get('/enterprises')
    enterprises.value = res.data.data.enterprises
    enterpriseOptions.value = enterprises.value.map((e: any) => ({ label: e.name, value: e.id }))
  } catch (e) {
    console.error(e)
  }
}

async function loadExcursions() {
  loading.value = true
  try {
    const res = await api.get('/excursions')
    excursions.value = res.data.data.excursions
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadRegistrations() {
  loading.value = true
  try {
    const res = await api.get('/excursions/registrations')
    registrations.value = res.data.data.registrations
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openExcursionModal(row?: any) {
  if (row?.id) {
    isExcursionEdit.value = true
    editingExcursionId.value = row.id
    excursionForm.value = {
      enterprise_id: row.enterprise_id,
      title: row.title || '',
      description: row.description || '',
      date_time: row.date_time || '',
      excursion_type: row.excursion_type || 'offline',
      address: row.address || '',
      stream_url: row.stream_url || '',
      max_participants: row.max_participants || 20,
      registration_deadline: row.registration_deadline || ''
    }
  } else {
    isExcursionEdit.value = false
    editingExcursionId.value = null
    excursionForm.value = {
      enterprise_id: null,
      title: '', description: '', date_time: '',
      excursion_type: 'offline', address: '', stream_url: '',
      max_participants: 20, registration_deadline: ''
    }
  }
  showExcursionModal.value = true
}

async function saveExcursion() {
  try {
    if (!excursionForm.value.enterprise_id) {
      alert('Выберите предприятие')
      return
    }
    if (!excursionForm.value.title || !excursionForm.value.date_time) {
      alert('Заполните обязательные поля')
      return
    }
    if (isExcursionEdit.value && editingExcursionId.value) {
      await api.put(`/excursions/${editingExcursionId.value}`, excursionForm.value)
    } else {
      await api.post('/excursions', excursionForm.value)
    }
    showExcursionModal.value = false
    loadExcursions()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка сохранения')
  }
}

async function deleteExcursion(id: number) {
  if (!confirm('Удалить экскурсию?')) return
  try {
    await api.delete(`/excursions/${id}`)
    loadExcursions()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

async function updateStatus(id: number, status: string) {
  try {
    await api.put(`/excursions/registrations/${id}/status`, { status })
    loadRegistrations()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка обновления статуса')
  }
}

onMounted(() => {
  loadEnterprises()
  loadExcursions()
  loadRegistrations()
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
}
.mb-4 { margin-bottom: 16px; }
</style>
