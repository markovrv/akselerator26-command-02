<template>
  <div class="excursions-view">
    <div class="page-container">
      <div class="page-header">
        <h1>Экскурсии на предприятия</h1>
        <p class="page-subtitle">Запишись на онлайн или офлайн экскурсию и увидь производство изнутри</p>
      </div>

      <div v-if="loading" class="page-loading">
        <div class="spinner"></div>
        <p>Загружаем экскурсии...</p>
      </div>

      <div v-else class="excursions-grid">
        <div
          v-for="excursion in excursions"
          :key="excursion.id"
          class="excursion-card"
        >
          <div class="exc-type-badge" :class="excursion.excursionType || excursion.type">
            {{ (excursion.excursion_type || excursion.type) === 'online' ? '📡 Онлайн' : '📍 Офлайн' }}
          </div>
          <h3>{{ excursion.title }}</h3>
          <p class="exc-enterprise">{{ excursion.enterpriseName }}</p>
          <p class="exc-desc">{{ excursion.description }}</p>
          <div class="exc-info">
            <div class="exc-info-item">
              <span>📅</span>
              <span>{{ formatDate(excursion.date_time) }}</span>
            </div>
            <div class="exc-info-item" v-if="excursion.address">
              <span>🏢</span>
              <span>{{ excursion.address }}</span>
            </div>
            <div class="exc-info-item">
              <span>👥</span>
              <span>Осталось мест: {{ excursion.available_slots }}</span>
            </div>
          </div>

          <!-- Кнопки: Записаться / Отписаться -->
          <button
            v-if="excursion.isUserRegistered"
            @click="unregisterFromExcursion(excursion.id)"
            class="btn btn-outline btn-full"
          >
            ✕ Отписаться
          </button>
          <button
            v-else
            @click="registerForExcursion(excursion.id)"
            :disabled="excursion.availableSlots === 0"
            class="btn btn-primary btn-full"
          >
            {{ excursion.availableSlots === 0 ? 'Мест нет' : 'Записаться' }}
          </button>
        </div>
      </div>

      <div v-if="!loading && !excursions.length" class="empty-state">
        <span>🚌</span>
        <p>Экскурсий пока нет. Следите за обновлениями!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const excursions = ref<any[]>([])

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

async function loadExcursions() {
  try {
    const [excRes, myRes] = await Promise.all([
      api.get('/excursions'),
      api.get('/excursions/my').catch(() => ({ data: { data: { registrations: [] } } }))
    ])

    const myIds = new Set((myRes.data.data.registrations || []).map((r: any) => r.excursion_id))

    if (excRes.data.success) {
      excursions.value = excRes.data.data.excursions.map((e: any) => ({
        ...e,
        isUserRegistered: myIds.has(e.id)
      }))
    }
  } catch (error) {
    console.error('Failed to load excursions:', error)
  } finally {
    loading.value = false
  }
}

async function registerForExcursion(excursionId: number) {
  try {
    const response = await api.post(`/excursions/${excursionId}/register`)
    if (response.data.success) {
      alert('Вы успешно записались на экскурсию!')
      loadExcursions()
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
      loadExcursions()
    }
  } catch (error: any) {
    alert(error?.response?.data?.error?.message || 'Ошибка при отписке')
  }
}

onMounted(loadExcursions)
</script>

<style scoped lang="scss">
.excursions-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;

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

.excursions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.excursion-card {
  padding: 28px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.063rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
}

.exc-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 12px;
  width: fit-content;

  &.online {
    background: #dbeafe;
    color: #2563eb;
  }

  &.offline {
    background: #dcfce7;
    color: #166534;
  }
}

.exc-enterprise {
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 8px;
}

.exc-desc {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.exc-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.exc-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.813rem;
  color: #64748b;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

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

  &-outline {
    background: transparent;
    color: #64748b;
    border: 1.5px solid #e2e8f0;

    &:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }
  }

  &-full {
    width: 100%;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 24px;

  span { font-size: 3rem; display: block; margin-bottom: 16px; }
  p { color: #94a3b8; }
}
</style>
