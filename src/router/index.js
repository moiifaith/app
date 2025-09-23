import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },
  {
    path: '/app',
    name: 'ZikrApp',
    component: () => import(/* webpackChunkName: "zikr-app" */ '../views/ZikrApp.vue')
  },
  {
    path: '/app/zikr/:id',
    name: 'ZikrCounter',
    component: () => import(/* webpackChunkName: "zikr" */ '../views/ZikrCounter.vue'),
    props: true
  },
  {
    path: '/app/history',
    name: 'ZikrHistory',
    component: () => import(/* webpackChunkName: "history" */ '../views/ZikrHistory.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/Admin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import(/* webpackChunkName: "admin-login" */ '../views/AdminLogin.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard for admin routes
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = localStorage.getItem('adminToken')
    if (!isAuthenticated) {
      next('/admin/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router