import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "auth" */ '../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "auth" */ '../views/Register.vue')
  },
  {
    path: '/zikr-app',
    name: 'ZikrApp',
    component: () => import(/* webpackChunkName: "zikr-app" */ '../views/ZikrApp.vue')
  },
  {
    path: '/app',
    redirect: '/zikr-app'
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
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isAdmin, initAuth } = useAuth()
  
  // Initialize auth if not already done
  if (!isAuthenticated.value) {
    await initAuth()
  }

  // Check admin routes
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAuthenticated.value || !isAdmin()) {
      next('/login')
      return
    }
  }

  // Check auth routes
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      next('/login')
      return
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated.value && (to.name === 'Login' || to.name === 'Register')) {
    next('/zikr-app')
    return
  }

  next()
})

export default router