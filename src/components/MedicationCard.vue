<template>
  <div class="card hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start space-x-4">
      <img 
        :src="medication.image" 
        :alt="medication.name"
        class="w-16 h-16 rounded-lg object-cover"
      >
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ medication.name }}</h3>
        <p class="text-gray-600 text-sm mt-1">{{ medication.description }}</p>
        
        <div class="mt-3 space-y-1">
          <div class="flex items-center text-sm text-gray-500">
            <span class="mr-2">⏰</span>
            <span>{{ scheduleText }}</span>
          </div>
          <div class="flex items-center text-sm text-gray-500">
            <span class="mr-2">📅</span>
            <span>{{ formatDate(medication.schedule.startDate) }} ～ {{ formatDate(medication.schedule.endDate) }}</span>
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

const scheduleText = computed(() => {
  const schedule = props.medication.schedule
  if (schedule.type === 'daily') {
    return `1日${schedule.dosesPerDay}回 (${schedule.times.join(', ')})`
  } else if (schedule.type === 'cyclical') {
    if (schedule.cyclePattern) {
      return `複雑なサイクル: ${schedule.cyclePattern.activeDays}日服用、${schedule.cyclePattern.breakDays}日休薬`
    } else {
      return 'サイクルスケジュール（設定不完全）'
    }
  }
  return '不明なスケジュール'
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}
</script>