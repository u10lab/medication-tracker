<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">副作用記録</h1>
        <p class="text-gray-600 mt-2">処方薬による副作用を記録・管理できます</p>
      </div>
      <button
        @click="showForm = true"
        class="btn-primary flex items-center space-x-2"
      >
        <span>⚠️</span>
        <span>副作用を記録</span>
      </button>
    </div>

    <!-- 統計サマリー -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">総記録数</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ sideEffects.length }}</p>
          </div>
          <div class="text-3xl">📊</div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">今月の記録</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ thisMonthCount }}</p>
          </div>
          <div class="text-3xl">📅</div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">最も多い症状</p>
            <p class="text-lg font-bold text-gray-900 mt-1">{{ mostCommonSymptom }}</p>
          </div>
          <div class="text-3xl">🔍</div>
        </div>
      </div>
    </div>

    <!-- フィルター -->
    <div class="card mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">処方薬で絞り込み</label>
          <select
            v-model="selectedMedication"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">すべての処方薬</option>
            <option v-for="medication in medications" :key="medication.id" :value="medication.id">
              {{ medication.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">重症度で絞り込み</label>
          <select
            v-model="selectedSeverity"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">すべての重症度</option>
            <option v-for="option in severityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">期間</label>
          <select
            v-model="selectedPeriod"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">すべて</option>
            <option value="week">過去1週間</option>
            <option value="month">過去1ヶ月</option>
            <option value="3months">過去3ヶ月</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 副作用記録一覧 -->
    <div v-if="filteredSideEffects.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">副作用の記録がありません</h3>
      <p class="text-gray-500 mb-6">副作用を記録して健康状態を管理しましょう</p>
      <button
        @click="showForm = true"
        class="btn-primary"
      >
        副作用を記録
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="effect in filteredSideEffects"
        :key="effect.id"
        class="card hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ getMedicationName(effect.medicationId) }}
              </h3>
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getSeverityClass(effect.severity)"
              >
                {{ getSeverityLabel(effect.severity) }}
              </span>
            </div>
            
            <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span>📅 {{ formatDate(effect.date) }}</span>
              <span>⏰ {{ effect.time }}</span>
            </div>
            
            <div class="mb-3">
              <h4 class="text-sm font-medium text-gray-700 mb-1">症状</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="symptom in effect.symptoms"
                  :key="symptom"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                >
                  {{ symptom }}
                </span>
              </div>
            </div>
            
            <div v-if="effect.notes" class="mb-3">
              <h4 class="text-sm font-medium text-gray-700 mb-1">詳細メモ</h4>
              <p class="text-sm text-gray-600">{{ effect.notes }}</p>
            </div>
          </div>
          
          <button
            @click="deleteSideEffect(effect.id)"
            class="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- 副作用記録フォーム -->
    <SideEffectForm
      v-if="showForm"
      @close="showForm = false"
      @save="saveSideEffect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SideEffectForm from '../components/SideEffectForm.vue'
import { medications, sideEffects, severityOptions } from '../data/mockData.js'

const showForm = ref(false)
const selectedMedication = ref('')
const selectedSeverity = ref('')
const selectedPeriod = ref('all')

const thisMonthCount = computed(() => {
  const thisMonth = new Date()
  thisMonth.setDate(1)
  const thisMonthString = thisMonth.toISOString().split('T')[0]
  
  return sideEffects.filter(effect => effect.date >= thisMonthString).length
})

const mostCommonSymptom = computed(() => {
  const symptomCounts = {}
  
  sideEffects.forEach(effect => {
    effect.symptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
    })
  })
  
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([,a], [,b]) => b - a)
  
  return sortedSymptoms.length > 0 ? sortedSymptoms[0][0] : 'なし'
})

const filteredSideEffects = computed(() => {
  let filtered = [...sideEffects]
  
  // 処方薬で絞り込み
  if (selectedMedication.value) {
    filtered = filtered.filter(effect => effect.medicationId === parseInt(selectedMedication.value))
  }
  
  // 重症度で絞り込み
  if (selectedSeverity.value) {
    filtered = filtered.filter(effect => effect.severity === selectedSeverity.value)
  }
  
  // 期間で絞り込み
  if (selectedPeriod.value !== 'all') {
    const now = new Date()
    let cutoffDate
    
    switch (selectedPeriod.value) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3months':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
    }
    
    if (cutoffDate) {
      const cutoffString = cutoffDate.toISOString().split('T')[0]
      filtered = filtered.filter(effect => effect.date >= cutoffString)
    }
  }
  
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ja-JP')
}

const getMedicationName = (medicationId) => {
  const medication = medications.find(med => med.id === medicationId)
  return medication ? medication.name : '不明な処方薬'
}

const getSeverityLabel = (severity) => {
  const option = severityOptions.find(opt => opt.value === severity)
  return option ? option.label : severity
}

const getSeverityClass = (severity) => {
  switch (severity) {
    case 'mild':
      return 'bg-green-100 text-green-700'
    case 'moderate':
      return 'bg-yellow-100 text-yellow-700'
    case 'severe':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const saveSideEffect = (sideEffectData) => {
  sideEffects.push(sideEffectData)
  showForm.value = false
}

const deleteSideEffect = (effectId) => {
  const index = sideEffects.findIndex(effect => effect.id === effectId)
  if (index !== -1) {
    sideEffects.splice(index, 1)
  }
}
</script>