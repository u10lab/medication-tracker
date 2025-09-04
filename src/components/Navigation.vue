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
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const navigation = [
  { name: 'Dashboard', href: '/', label: 'ダッシュボード', icon: '📊' },
  { name: 'Medications', href: '/medications', label: '処方薬管理', icon: '💊' },
  { name: 'Calendar', href: '/calendar', label: 'カレンダー', icon: '📅' },
  { name: 'SideEffects', href: '/side-effects', label: '副作用記録', icon: '⚠️' }
]
</script>