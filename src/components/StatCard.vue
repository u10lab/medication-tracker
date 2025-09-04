<template>
  <div class="card">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
      <div class="text-3xl">{{ icon }}</div>
    </div>
    
    <div v-if="trend" class="mt-4 flex items-center">
      <span 
        class="text-sm font-medium"
        :class="trend.type === 'up' ? 'text-success-600' : trend.type === 'down' ? 'text-red-600' : 'text-gray-600'"
      >
        {{ trend.type === 'up' ? '↗' : trend.type === 'down' ? '↘' : '→' }}
        {{ trend.value }}
      </span>
      <span class="text-sm text-gray-500 ml-2">{{ trend.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  trend: {
    type: Object,
    default: null
  }
})
</script>