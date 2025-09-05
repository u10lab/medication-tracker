<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">ダッシュボード</h1>
      <p class="text-gray-600 mt-2">今日は{{ formatDate(new Date()) }}です</p>
    </div>

    <!-- 統計カード -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="今日の服薬率"
        :value="todayAdherence + '%'"
        subtitle="目標: 100%"
        icon="📊"
        :trend="{ type: 'up', value: '+5%', label: '先週比' }"
      />
      
      <StatCard
        title="登録処方薬数"
        :value="medications.length"
        subtitle="アクティブ"
        icon="💊"
      />
      
      <StatCard
        title="今週の服薬率"
        :value="weeklyAdherence + '%'"
        subtitle="7日間平均"
        icon="📈"
        :trend="{ type: 'up', value: '+2%', label: '先週比' }"
      />
      
      <StatCard
        title="副作用記録"
        :value="recentSideEffects"
        subtitle="今月"
        icon="⚠️"
        :trend="{ type: 'down', value: '-1', label: '先月比' }"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 今日のスケジュール -->
      <DailySchedule />
      
      <!-- 最近の副作用 -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">最近の副作用</h2>
          <router-link 
            to="/side-effects"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            すべて見る →
          </router-link>
        </div>
        
        <div v-if="recentSideEffectsList.length === 0" class="text-center py-8 text-gray-500">
          副作用の記録はありません
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="effect in recentSideEffectsList.slice(0, 3)"
            :key="effect.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium text-gray-900">{{ getMedicationName(effect.medicationId) }}</h3>
              <span 
                class="text-xs px-2 py-1 rounded-full"
                :class="getSeverityClass(effect.severity)"
              >
                {{ getSeverityLabel(effect.severity) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ effect.symptoms.join(', ') }}</p>
            <p class="text-xs text-gray-500">{{ formatDateTime(effect.date, effect.time) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ミニカレンダー -->
    <div class="mt-8">
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">今月の服薬状況</h2>
          <router-link 
            to="/calendar"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            詳細カレンダー →
          </router-link>
        </div>
        
        <div class="grid grid-cols-7 gap-2">
          <div v-for="day in miniCalendar" :key="day.key" class="text-center">
            <div class="text-xs text-gray-500 mb-1">{{ day.dayName }}</div>
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="day.className"
            >
              {{ day.day }}
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-success-500"></div>
            <span class="text-gray-600">100%服薬</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span class="text-gray-600">部分的</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-gray-600">未服薬</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import DailySchedule from '../components/DailySchedule.vue'
import { medications, medicationLogs, sideEffects, severityOptions } from '../data/mockData.js'

const today = new Date().toISOString().split('T')[0]

const todayAdherence = computed(() => {
  const todayLogs = medicationLogs.filter(log => log.date === today)
  if (todayLogs.length === 0) return 0
  const takenCount = todayLogs.filter(log => log.taken).length
  return Math.round((takenCount / todayLogs.length) * 100)
})

const weeklyAdherence = computed(() => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoString = weekAgo.toISOString().split('T')[0]
  
  const weekLogs = medicationLogs.filter(log => log.date >= weekAgoString && log.date <= today)
  if (weekLogs.length === 0) return 0
  const takenCount = weekLogs.filter(log => log.taken).length
  return Math.round((takenCount / weekLogs.length) * 100)
})

const recentSideEffects = computed(() => {
  const monthAgo = new Date()
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const monthAgoString = monthAgo.toISOString().split('T')[0]
  
  return sideEffects.filter(effect => effect.date >= monthAgoString).length
})

const recentSideEffectsList = computed(() => {
  return [...sideEffects]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5)
})

const miniCalendar = computed(() => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  
  const days = []
  const dayNames = ['日', '月', '火', '水', '木', '金', '土']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateString = date.toISOString().split('T')[0]
    
    const dayLogs = medicationLogs.filter(log => log.date === dateString)
    let className = 'bg-gray-100 text-gray-400'
    
    if (dayLogs.length > 0) {
      const takenCount = dayLogs.filter(log => log.taken).length
      const adherenceRate = (takenCount / dayLogs.length) * 100
      
      if (adherenceRate === 100) {
        className = 'bg-success-500 text-white'
      } else if (adherenceRate > 0) {
        className = 'bg-yellow-500 text-white'
      } else {
        className = 'bg-red-500 text-white'
      }
    }
    
    if (dateString === today.toISOString().split('T')[0]) {
      className += ' ring-2 ring-primary-500'
    }
    
    days.push({
      key: dateString,
      day: date.getDate(),
      dayName: dayNames[i],
      className: className
    })
  }
  
  return days
})

const formatDate = (date) => {
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

const formatDateTime = (date, time) => {
  const dateObj = new Date(date)
  return `${dateObj.toLocaleDateString('ja-JP')} ${time}`
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
</script>