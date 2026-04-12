<template>
  <div>
    <h2>Файлы</h2>

    <div class="upload-area">
      <input type="file" ref="fileInput" multiple @change="onFileSelected" style="display: none" />
      <VaButton @click="(fileInput as HTMLInputElement | null)?.click()">
        Выбрать файлы
      </VaButton>
      <p v-if="selectedFiles.length">
        Выбрано: {{ selectedFiles.map(f => f.name).join(', ') }}
      </p>
      <VaButton
        @click="uploadSelected"
        :disabled="!selectedFiles.length"
        class="mt-4"
      >
        Загрузить
      </VaButton>
    </div>

    <VaDataTable
      :items="files"
      :columns="columns"
      :loading="loading"
      hoverable
      class="mt-8"
    >
      <template #cell(fileSize)="{ rowData }">
        {{ formatSize(rowData.fileSize) }}
      </template>
      <template #cell(actions)="{ rowData }">
        <VaButton preset="primary" size="small" :href="`/api/files/${rowData.filename}`" target="_blank">
          📥
        </VaButton>
        <VaButton preset="primary" size="small" color="danger" @click="deleteFile(rowData.id)">
          🗑️
        </VaButton>
      </template>
    </VaDataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

interface FileRecord {
  id: number
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  mimeType: string
  createdAt: string
}

const files = ref<FileRecord[]>([])
const loading = ref(false)
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'originalName', label: 'Имя файла' },
  { key: 'fileType', label: 'Тип', width: '80px' },
  { key: 'fileSize', label: 'Размер', width: '100px' },
  { key: 'createdAt', label: 'Дата', width: '160px' },
  { key: 'actions', label: '', width: '100px' }
]

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

async function uploadSelected() {
  for (const file of selectedFiles.value) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } catch (e: any) {
      alert(`Ошибка загрузки ${file.name}: ${e.response?.data?.error?.message || e.message}`)
    }
  }

  selectedFiles.value = []
  if (fileInput.value) fileInput.value.value = ''
  loadFiles()
}

async function deleteFile(id: number) {
  if (!confirm('Удалить файл?')) return
  try {
    await api.delete(`/files/${id}`)
    loadFiles()
  } catch (e) {
    alert('Ошибка удаления')
  }
}

async function loadFiles() {
  loading.value = true
  try {
    const res = await api.get('/files')
    files.value = res.data.data.files
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadFiles)
</script>

<style scoped>
.upload-area {
  margin-bottom: 24px;
  padding: 24px;
  background: #f5f5f5;
  border-radius: 8px;
  text-align: center;
}
.mt-4 { margin-top: 16px; }
.mt-8 { margin-top: 32px; }
</style>
