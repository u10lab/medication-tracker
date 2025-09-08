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
const router = useRouter()
const route = useRoute()

onMounted(async () => {
  // Initialize auth state
  await authStore.initialize()
})

// Watch for auth state changes and handle routing
watch(
  () => authStore.isAuthenticated,
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