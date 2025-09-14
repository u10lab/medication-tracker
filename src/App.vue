<template>
  <div id="app" class="min-h-screen bg-gray-50">
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
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navigation from './components/Navigation.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
// Piniaで定義された認証ストア（authStore）を使えるように
const router = useRouter()
// Vue Routerの機能（例: router.push('/login') のようなページ遷移）をプログラムで実行
const route = useRoute()
// 現在表示しているページのルート情報（URL、ルート名、metaデータなど）を取得

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