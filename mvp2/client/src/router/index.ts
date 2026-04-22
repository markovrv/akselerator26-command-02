import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/enterprises',
    name: 'enterprises',
    component: () => import('@/views/EnterprisesView.vue')
  },
  {
    path: '/enterprises/:id',
    name: 'enterprise-details',
    component: () => import('@/views/EnterpriseDetailsView.vue')
  },
  {
    path: '/vacancies',
    name: 'vacancies',
    component: () => import('@/views/VacanciesView.vue')
  },
  {
    path: '/vacancies/:id',
    name: 'vacancy-details',
    component: () => import('@/views/VacancyDetailsView.vue')
  },
  {
    path: '/excursions',
    name: 'excursions',
    component: () => import('@/views/ExcursionsView.vue')
  },
  {
    path: '/my-excursions',
    name: 'my-excursions',
    component: () => import('@/views/MyExcursionsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminLayoutView.vue'),
    meta: { requires_auth: true, requires_admin: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  if (to.meta.requires_auth && !token) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requires_admin && user?.role !== 'admin') {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
