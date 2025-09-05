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
import { onMounted } from 'vue'
import Navigation from './components/Navigation.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialize auth state
  await authStore.initialize()
})
</script>