<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- デバッグ情報（開発環境のみ） -->
    <div v-if="isDevelopment" class="bg-yellow-100 p-2 text-xs text-gray-700">
      <div>🔧 Debug Info:</div>
      <div>API URL: {{ apiUrl }}</div>
      <div>Supabase URL: {{ supabaseUrl }}</div>
      <div>Auth Loading: {{ authStore.loading }}</div>
      <div>Is Authenticated: {{ authStore.isAuthenticated }}</div>
      <div>User: {{ authStore.userEmail || 'null' }}</div>
    </div>
    
    <div v-if="authStore.loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    <div v-else>
      <Navigation v-if="authStore.isAuthenticated" />
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navigation from './components/Navigation.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
// Piniaで定義された認証ストア（authStore）を使えるように
const router = useRouter()
// Vue Routerの機能（例: router.push('/login') のようなページ遷移）をプログラムで実行
const route = useRoute()
// 現在表示しているページのルート情報（URL、ルート名、metaデータなど）を取得

// デバッグ用の計算プロパティ
const isDevelopment = computed(() => import.meta.env.DEV)
const apiUrl = computed(() => import.meta.env.VITE_API_URL || 'Not set')
const supabaseUrl = computed(() => import.meta.env.VITE_SUPABASE_URL || 'Not set')

onMounted(async () => {
  // Initialize auth state
  await authStore.initialize()
})
// まず authStore の initialize アクションを実行。
// このアクションは、Supabaseなどに問い合わせて、有効なセッション情報が残っているかを確認し、ユーザーのログイン状態を確定させる役割

watch(
  () => authStore.isAuthenticated,
  // 「ルートガード」と呼ばれるVue Routerの機能
  (isAuthenticated) => {
    if (!authStore.loading) {
      const requiresAuth = route.meta.requiresAuth
      const requiresGuest = route.meta.requiresGuest
      
      // Only redirect if we're not already on the correct page
      if (requiresAuth && !isAuthenticated && route.name !== 'Login') {
        router.push('/login')
      } else if (requiresGuest && isAuthenticated && route.name !== 'Dashboard') {
        router.push('/')
      }
    }
  },
  { immediate: true }
)
</script>