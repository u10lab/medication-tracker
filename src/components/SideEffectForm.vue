<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">副作用を記録</h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">薬物</label>
              <select
                v-model="form.medicationId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">薬物を選択</option>
                <option v-for="medication in medications" :key="medication.id" :value="medication.id">
                  {{ medication.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">日付</label>
              <input
                v-model="form.date"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">時間</label>
            <input
              v-model="form.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">症状（複数選択可）</label>
            <div class="grid grid-cols-3 gap-2">
              <label
                v-for="symptom in commonSymptoms"
                :key="symptom"
                class="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-primary-50 border-primary-300': form.symptoms.includes(symptom) }"
              >
                <input
                  type="checkbox"
                  :value="symptom"
                  v-model="form.symptoms"
                  class="text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm">{{ symptom }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">重症度</label>
            <div class="flex space-x-4">
              <label
                v-for="option in severityOptions"
                :key="option.value"
                class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                :class="{ 'bg-primary-50 border-primary-300': form.severity === option.value }"
              >
                <input
                  type="radio"
                  :value="option.value"
                  v-model="form.severity"
                  class="text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm font-medium" :class="option.color">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">詳細メモ</label>
            <textarea
              v-model="form.notes"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="副作用の詳細、発生状況、対処法などを記録してください..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-secondary"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { medications, commonSymptoms, severityOptions } from '../data/mockData.js'

defineEmits(['close', 'save'])

const form = ref({
  medicationId: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  symptoms: [],
  severity: 'mild',
  notes: ''
})

const handleSubmit = () => {
  const sideEffect = {
    id: Date.now(),
    medicationId: parseInt(form.value.medicationId),
    date: form.value.date,
    time: form.value.time,
    symptoms: [...form.value.symptoms],
    severity: form.value.severity,
    notes: form.value.notes,
    timestamp: new Date().toISOString()
  }
  
  emit('save', sideEffect)
}
</script>