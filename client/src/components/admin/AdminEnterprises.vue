<template>
  <div>
    <div class="section-header">
      <h2>Предприятия</h2>
      <VaButton icon="add" @click="openModal()">Добавить</VaButton>
    </div>

    <VaDataTable
      :items="enterprises"
      :columns="columns"
      :loading="loading"
      hoverable
      clickable
      @rowClick="openModal($event)"
    >
      <template #cell(actions)="{ rowData }">
        <VaButton preset="primary" size="small" @click.stop="openModal(rowData)">✏️</VaButton>
        <VaButton preset="primary" size="small" color="danger" @click.stop="deleteEnterprise(rowData.id)">🗑️</VaButton>
      </template>
    </VaDataTable>

    <!-- Modal -->
    <VaModal
      v-model="showModal"
      :title="isEdit ? 'Редактировать предприятие' : 'Новое предприятие'"
      ok-text="Сохранить"
      cancel-text="Отмена"
      @ok="saveEnterprise"
    >
      <VaForm ref="formRef">
        <VaInput
          v-model="form.name"
          label="Название *"
          :rules="[(v: string) => !!v || 'Обязательное поле']"
          class="mb-4"
        />
        <VaTextarea
          v-model="form.description"
          label="Описание"
          :autosize="true"
          class="mb-4"
        />
        <VaInput
          v-model="form.contact_email"
          label="Email"
          class="mb-4"
        />
        <VaInput
          v-model="form.contact_phone"
          label="Телефон"
          class="mb-4"
        />
        <VaInput
          v-model="form.city"
          label="Город"
          class="mb-4"
        />
        <VaInput
          v-model="form.address"
          label="Адрес"
          class="mb-4"
        />
        <VaInput
          v-model="form.website"
          label="Сайт"
          class="mb-4"
        />
        <VaInput
          v-model="form.logo_url"
          label="URL логотипа"
          class="mb-4"
        />
      </VaForm>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface Enterprise {
  id: number
  name: string
  description: string
  contact_email: string
  contact_phone: string
  city: string
  address: string
  website: string
  logo_url: string
  is_active: boolean
  vacanciesCount: number
}

const enterprises = ref<Enterprise[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref()

const form = ref({
  name: '',
  description: '',
  contact_email: '',
  contact_phone: '',
  city: '',
  address: '',
  website: '',
  logo_url: ''
})

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: 'Название' },
  { key: 'city', label: 'Город', width: '150px' },
  { key: 'contact_email', label: 'Email', width: '200px' },
  { key: 'vacanciesCount', label: 'Вакансии', width: '100px' },
  { key: 'actions', label: '', width: '100px' }
]

async function loadEnterprises() {
  loading.value = true
  try {
    const res = await api.get('/enterprises')
    enterprises.value = res.data.data.enterprises
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openModal(row?: any) {
  if (row && row.id) {
    isEdit.value = true
    editingId.value = row.id
    form.value = {
      name: row.name || '',
      description: row.description || '',
      contact_email: row.contact_email || '',
      contact_phone: row.contact_phone || '',
      city: row.city || '',
      address: row.address || '',
      website: row.website || '',
      logo_url: row.logo_url || ''
    }
  } else {
    isEdit.value = false
    editingId.value = null
    form.value = { name: '', description: '', contact_email: '', contact_phone: '', city: '', address: '', website: '', logo_url: '' }
  }
  showModal.value = true
}

async function saveEnterprise() {
  try {
    if (isEdit.value && editingId.value) {
      await api.put(`/enterprises/${editingId.value}`, form.value)
    } else {
      await api.post('/enterprises', form.value)
    }
    showModal.value = false
    loadEnterprises()
  } catch (e: any) {
    alert(e.response?.data?.error?.message || 'Ошибка сохранения')
  }
}

async function deleteEnterprise(id: number) {
  if (!confirm('Удалить предприятие?')) return
  try {
    await api.delete(`/enterprises/${id}`)
    loadEnterprises()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

onMounted(loadEnterprises)
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
