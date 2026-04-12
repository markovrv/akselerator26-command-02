<template>
  <div class="admin-layout">
    <VaNavbar color="primary">
      <template #left>
        <VaNavbarItem>
          <strong>Админ-панель</strong>
        </VaNavbarItem>
      </template>
      <template #right>
        <VaButton preset="primary" size="small" @click="goToPublic">
          Перейти на сайт
        </VaButton>
        <VaButton preset="primary" size="small" @click="logout">
          Выйти
        </VaButton>
      </template>
    </VaNavbar>

    <div class="admin-body">
      <VaTabs v-model="activeTab" color="primary">
        <template #tabs>
          <VaTab name="enterprises">🏭 Предприятия</VaTab>
          <VaTab name="vacancies">💼 Вакансии</VaTab>
          <VaTab name="excursions">🚌 Экскурсии</VaTab>
          <VaTab name="users">👥 Пользователи</VaTab>
          <VaTab name="files">📁 Файлы</VaTab>
        </template>
      </VaTabs>

      <div class="tab-content">
        <AdminEnterprises v-if="activeTab === 'enterprises'" />
        <AdminVacancies v-if="activeTab === 'vacancies'" />
        <AdminExcursions v-if="activeTab === 'excursions'" />
        <AdminUsers v-if="activeTab === 'users'" />
        <AdminFiles v-if="activeTab === 'files'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminEnterprises from '@/components/admin/AdminEnterprises.vue'
import AdminVacancies from '@/components/admin/AdminVacancies.vue'
import AdminExcursions from '@/components/admin/AdminExcursions.vue'
import AdminUsers from '@/components/admin/AdminUsers.vue'
import AdminFiles from '@/components/admin/AdminFiles.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('enterprises')

function goToPublic() {
  router.push('/')
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-body {
  flex: 1;
  padding: 24px;
  background: #f4f6fa;
}

.tab-content {
  margin-top: 20px;
}
</style>
