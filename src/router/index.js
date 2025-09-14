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
  // history: createWebHistory(): これにより、ブラウザのURLが https://example.com/login のような、すっきりとした見た目になる。
  routes
// routes: 先ほど定義した routes 配列（地図）をルーターに読み込ませる。
})


// 「ナビゲーションガード」と呼ばれ、ユーザーがページを移動する直前に必ず実行される関所のような機能
// App.vue の watch が「状態の変化を監視」するのに対し、beforeEach は「全てのページ移動を監視」
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.loading) {
    await new Promise((resolve) => {
// 状況: ユーザーがログイン必須ページ（/dashboard）に直接アクセスすると、beforeEachはすぐに動くが、その時点ではSupabaseへの認証確認が終わっておらず、authStore.loadingはtrue、isAuthenticatedはfalse
// 問題: この待機処理がないと、認証確認が終わる前に「未ログイン」と誤判定され、ログインページにリダイレクトされてしまう。
      const unwatch = authStore.$subscribe(() => {
        // Piniaストアのあらゆる変更を監視
        if (!authStore.loading) {
          unwatch()
          resolve()
          // Promiseを解決し、一時停止していたbeforeEachの処理を再開
        }
      })
    })
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (to.name === from.name || to.path === from.path) {
    next()
    return
  }
  

  if (requiresAuth && !authStore.isAuthenticated && to.name !== 'Login') {
    // requiresAuth: 行き先のページに meta: { requiresAuth: true } が設定されている場合 true になる。
    next({ name: 'Login' })
  } else if (requiresGuest && authStore.isAuthenticated && to.name !== 'Dashboard') {
    // Redirect to dashboard if already authenticated
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router