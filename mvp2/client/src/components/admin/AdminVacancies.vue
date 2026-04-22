<template>
  <div>
    <div class="section-header">
      <h2>Вакансии</h2>
      <VaButton icon="add" @click="openModal()">Добавить</VaButton>
    </div>

    <VaSelect
      v-model="selectedEnterprise"
      :options="enterpriseOptions"
      label="Предприятие"
      text-by="label"
      value-by="value"
      clearable
      class="mb-4"
      @update:model-value="loadVacancies"
    />

    <VaDataTable
      :items="vacancies"
      :columns="columns"
      :loading="loading"
      hoverable
    >
      <template #cell(salaryMin)="{ rowData }">
        {{ formatSalary(rowData.salary_min) }} – {{ formatSalary(rowData.salary_max) }} ₽
      </template>
      <template #cell(actions)="{ rowData }">
        <VaButton preset="primary" size="small" @click="openModal(rowData)">✏️</VaButton>
        <VaButton preset="primary" size="small" color="danger" @click="deleteVacancy(rowData.id)">🗑️</VaButton>
      </template>
    </VaDataTable>

    <!-- Modal -->
    <VaModal
      v-model="showModal"
      :title="isEdit ? 'Редактировать вакансию' : 'Новая вакансия'"
      ok-text="Сохранить"
      cancel-text="Отмена"
      @ok="saveVacancy"
    >
      <VaForm ref="formRef">
        <VaSelect
          v-model="form.enterprise_id"
          :options="enterpriseOptions"
          label="Предприятие *"
          value-by="value"
          text-by="label"
          class="mb-4"
        />
        <VaInput
          v-model="form.title"
          label="Название вакансии *"
          class="mb-4"
        />
        <VaTextarea
          v-model="form.description"
          label="Описание"
          class="mb-4"
        />
        <VaTextarea
          v-model="form.requirements"
          label="Требования"
          class="mb-4"
        />
        <VaInput
          v-model="form.city"
          label="Город"
          class="mb-4"
        />
        <div class="row">
          <VaInput
            v-model.number="form.salary_min"
            label="ЗП мин"
            type="number"
            class="mb-4 col"
          />
          <VaInput
            v-model.number="form.salary_max"
            label="ЗП макс"
            type="number"
            class="mb-4 col"
          />
        </div>
        <VaTextarea
          v-model="form.job_instructions"
          label="Должностная инструкция"
          class="mb-4"
        />
        <VaTextarea
          v-model="form.salary_calculation"
          label="Порядок расчета ЗП"
          class="mb-4"
        />
        <VaInput
          v-model="form.collective_agreement_url"
          label="URL коллективного договора (PDF)"
          class="mb-4"
        />
        <VaInput
          v-model="form.three_d_model_url"
          label="URL 3D-модели (.glb)"
          class="mb-4"
        />
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface Vacancy {
  id: number
  enterprise_id: number
  enterpriseName: string
  title: string
  description: string
  requirements: string
  city: string
  salary_min: number | null
  salary_max: number | null
  job_instructions: string
  salary_calculation: string
  collective_agreement_url: string
  three_d_model_url: string
  is_active: boolean
}

const vacancies = ref<Vacancy[]>([])
const enterprises = ref<any[]>([])
const enterpriseOptions = ref<{ label: string; value: number }[]>([])
const selectedEnterprise = ref<number | null>(null)
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  enterprise_id: null as number | null,
  title: '',
  description: '',
  requirements: '',
  city: '',
  salary_min: null as number | null,
  salary_max: null as number | null,
  job_instructions: '',
  salary_calculation: '',
  collective_agreement_url: '',
  three_d_model_url: ''
})

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'title', label: 'Вакансия' },
  { key: 'enterpriseName', label: 'Предприятие' },
  { key: 'city', label: 'Город', width: '130px' },
  { key: 'salary_min', label: 'ЗП', width: '180px' },
  { key: 'actions', label: '', width: '100px' }
]

function formatSalary(v: number | null) {
  return v ? v.toLocaleString('ru-RU') : 'не указана'
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

async function loadVacancies() {
  loading.value = true
  try {
    const params: any = {}
    if (selectedEnterprise.value) params.enterprise_id = selectedEnterprise.value
    const res = await api.get('/vacancies', { params })
    vacancies.value = res.data.data.vacancies
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openModal(row?: any) {
  if (row?.id) {
    isEdit.value = true
    editingId.value = row.id
    form.value = {
      enterprise_id: row.enterprise_id,
      title: row.title || '',
      description: row.description || '',
      requirements: row.requirements || '',
      city: row.city || '',
      salary_min: row.salary_min,
      salary_max: row.salary_max,
      job_instructions: row.job_instructions || '',
      salary_calculation: row.salary_calculation || '',
      collective_agreement_url: row.collective_agreement_url || '',
      three_d_model_url: row.three_d_model_url || ''
    }
  } else {
    isEdit.value = false
    editingId.value = null
    form.value = {
      enterprise_id: selectedEnterprise.value,
      title: '', description: '', requirements: '', city: '',
      salary_min: null, salary_max: null,
      job_instructions: '', salary_calculation: '',
      collective_agreement_url: '', three_d_model_url: ''
    }
  }
  showModal.value = true
}

async function saveVacancy() {
  try {
    if (!form.value.enterprise_id) {
      alert('Выберите предприятие')
      return
    }
    if (isEdit.value && editingId.value) {
      await api.put(`/vacancies/${editingId.value}`, form.value)
    } else {
      await api.post('/vacancies', form.value)
    }
    showModal.value = false
    loadVacancies()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка сохранения')
  }
}

async function deleteVacancy(id: number) {
  if (!confirm('Удалить вакансию?')) return
  try {
    await api.delete(`/vacancies/${id}`)
    loadVacancies()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

onMounted(() => {
  loadEnterprises()
  loadVacancies()
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.mb-4 { margin-bottom: 16px; }
.row { display: flex; gap: 16px; }
.col { flex: 1; }
</style>
