<template>
  <div class="my-excursions-view container">
    <h1>Мои записи на экскурсии</h1>
    
    <div v-if="loading" class="loading">
      <p>Загрузка...</p>
    </div>

    <div v-else-if="registrations.length === 0" class="empty">
      <p>У вас пока нет записей на экскурсии</p>
      <router-link to="/excursions" class="btn-browse">
        Посмотреть экскурсии
      </router-link>
    </div>

    <div v-else class="registrations-list">
      <div 
        v-for="registration in registrations" 
        :key="registration.id"
        class="registration-card"
      >
        <div class="card-header">
          <h3>{{ registration.excursionTitle }}</h3>
          <span :class="['status-badge', registration.status]">
            {{ getStatusText(registration.status) }}
          </span>
        </div>
        
        <p class="enterprise">{{ registration.enterpriseName }}</p>
        <p class="date">📅 {{ formatDate(registration.dateTime) }}</p>
        <p class="type">{{ registration.type === 'online' ? 'Онлайн' : 'Офлайн' }}</p>
        
        <div class="actions">
          <a 
            v-if="registration.medicalReferralUrl"
            :href="registration.medicalReferralUrl"
            class="btn-download"
          >
            📄 Скачать направление на медосмотр
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const registrations = ref<any[]>([])

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'На рассмотрении',
    confirmed: 'Подтверждено',
    cancelled: 'Отменено',
    completed: 'Завершено'
  }
  return statusMap[status] || status
}

async function loadRegistrations() {
  try {
    const response = await api.get('/excursions/my')
    if (response.data.success) {
      registrations.value = response.data.data.registrations
    }
  } catch (error) {
    console.error('Failed to load registrations:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRegistrations()
})
</script>

<style scoped lang="scss">
.my-excursions-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;

  h1 {
    text-align: center;
    margin-bottom: 40px;
  }
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.btn-browse {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }
}

.registrations-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.registration-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  h3 {
    margin: 0;
  }
}

.status-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;

  &.pending {
    background: #fff3e0;
    color: #f57c00;
  }

  &.confirmed {
    background: #e8f5e9;
    color: #388e3c;
  }

  &.cancelled {
    background: #ffebee;
    color: #d32f2f;
  }

  &.completed {
    background: #e3f2fd;
    color: #1976d2;
  }
}

.enterprise {
  color: #666;
  margin-bottom: 10px;
}

.date, .type {
  color: #666;
  margin: 5px 0;
}

.actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn-download {
  display: inline-block;
  padding: 12px 20px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: #5568d3;
  }
}
</style>
