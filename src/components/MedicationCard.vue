<template>
  <div class="card hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start space-x-4">
      <div class="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
        <span class="text-2xl">💊</span>
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ medication.name }}</h3>
        <p class="text-gray-600 text-sm mt-1">{{ medication.description || '説明なし' }}</p>
        
        <div class="mt-3 space-y-1">
          <div v-if="medication.generic_name" class="flex items-center text-sm text-gray-500">
            <span class="mr-2">🏷️</span>
            <span>一般名: {{ medication.generic_name }}</span>
          </div>
          <div v-if="medication.dosage_form" class="flex items-center text-sm text-gray-500">
            <span class="mr-2">💊</span>
            <span>剤形: {{ medication.dosage_form }}</span>
          </div>
          <div v-if="medication.strength" class="flex items-center text-sm text-gray-500">
            <span class="mr-2">📏</span>
            <span>用量: {{ medication.strength }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <span class="mr-2">📅</span>
            <span>登録日: {{ formatDate(medication.created_at) }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="$emit('edit', medication)"
          class="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
        >
          ✏️
        </button>
        <button 
          @click="$emit('delete', medication.id)"
          class="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  medication: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

// Remove the scheduleText computed property as it's no longer needed

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}
</script>