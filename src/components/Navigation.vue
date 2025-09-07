<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <h1 class="text-xl font-bold text-primary-600">💊 処方薬管理</h1>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="$route.name === item.name 
              ? 'bg-primary-100 text-primary-700' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.label }}
          </router-link>
          
          <!-- User menu -->
          <div class="relative ml-3">
            <div class="flex items-center space-x-3">
              <div class="text-sm">
                <span class="text-gray-700">{{ authStore.userName }}</span>
                <span v-if="authStore.hasApiAccess" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  API接続済み
                </span>
                <span v-else class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  API未接続
                </span>
              </div>
              <button
                @click="handleLogout"
                :disabled="authStore.loading"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', href: '/', label: 'ダッシュボード', icon: '📊' },
  { name: 'Medications', href: '/medications', label: '処方薬管理', icon: '💊' },
  { name: 'Calendar', href: '/calendar', label: 'カレンダー', icon: '📅' },
  { name: 'SideEffects', href: '/side-effects', label: '副作用記録', icon: '⚠️' }
]

const handleLogout = async () => {
  try {
    await authStore.signOut()
    // Use nextTick to ensure DOM updates are complete before navigation
    await nextTick()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Force navigation even if logout fails
    router.push('/login')
  }
}
</script>