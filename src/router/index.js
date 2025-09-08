import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Dashboard from '../views/Dashboard.vue'
import Medications from '../views/Medications.vue'
import Calendar from '../views/Calendar.vue'
import SideEffects from '../views/SideEffects.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

const routes = [
  // Protected routes (require authentication)
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/medications',
    name: 'Medications',
    component: Medications,
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: Calendar,
    meta: { requiresAuth: true }
  },
  {
    path: '/side-effects',
    name: 'SideEffects',
    component: SideEffects,
    meta: { requiresAuth: true }
  },
  
  // Public routes (guest only)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards - temporarily disabled to prevent infinite loops
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore()
//   
//   // Wait for auth initialization if still loading
//   if (authStore.loading) {
//     // Create a promise that resolves when auth is no longer loading
//     await new Promise((resolve) => {
//       const unwatch = authStore.$subscribe(() => {
//         if (!authStore.loading) {
//           unwatch()
//           resolve()
//         }
//       })
//     })
//   }
//   
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
//   const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
//   
//   // Prevent infinite redirects - check if we're already on the target route
//   if (to.name === from.name || to.path === from.path) {
//     next()
//     return
//   }
//   
//   // Prevent redirect loops between login and dashboard
//   if (requiresAuth && !authStore.isAuthenticated && to.name !== 'Login') {
//     // Redirect to login if not authenticated
//     next({ name: 'Login' })
//   } else if (requiresGuest && authStore.isAuthenticated && to.name !== 'Dashboard') {
//     // Redirect to dashboard if already authenticated
//     next({ name: 'Dashboard' })
//   } else {
//     next()
//   }
// })

export default router