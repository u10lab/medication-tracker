<template>
  <div class="card">
    <h2 class="text-xl font-bold text-gray-900 mb-6">今日の服薬予定</h2>
    
    <div v-if="todaySchedule.length === 0" class="text-center py-8 text-gray-500">
      今日の服薬予定はありません
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="item in todaySchedule"
        :key="item.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        :class="{
          'bg-success-50 border-success-200': item.taken,
          'bg-red-50 border-red-200': !item.taken && isPastTime(item.time)
        }"
      >
        <div class="flex items-center space-x-4">
          <img 
            :src="item.image" 
            :alt="item.name"
            class="w-12 h-12 rounded-lg object-cover"
          >
          <div>
            <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ item.time }}</p>
            <p class="text-xs text-gray-400">{{ item.description }}</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <div
            class="w-4 h-4 rounded-full"
            :class="{
              'bg-success-500': item.taken,
              'bg-red-500': !item.taken && isPastTime(item.time),
              'bg-gray-300': !item.taken && !isPastTime(item.time)
            }"
          ></div>
          
          <button
            @click="toggleMedication(item)"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
            :class="item.taken 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-success-100 text-success-700 hover:bg-success-200'"
          >
            {{ item.taken ? '未服薬' : '服薬済み' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 服薬率表示 -->
    <div v-if="todaySchedule.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600">今日の服薬率</span>
        <span class="text-lg font-bold" :class="adherenceRateColor">{{ adherenceRate }}%</span>
      </div>
      <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="adherenceRate === 100 ? 'bg-success-500' : adherenceRate > 50 ? 'bg-yellow-500' : 'bg-red-500'"
          :style="{ width: adherenceRate + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { medications, medicationLogs } from '../data/mockData.js'

const today = new Date().toISOString().split('T')[0]

const todaySchedule = computed(() => {
  const schedule = []
  
  medications.forEach(medication => {
    const medSchedule = medication.schedule
    const date = new Date(today)
    
    // 開始日と終了日をチェック
    if (date < new Date(medSchedule.startDate) || date > new Date(medSchedule.endDate)) {
      return
    }
    
    // スケジュールタイプに応じて処理
    if (medSchedule.type === 'daily') {
      medSchedule.times.forEach(time => {
        const log = medicationLogs.find(log => 
          log.medicationId === medication.id && 
          log.date === today && 
          log.time === time
        )
        
        schedule.push({
          id: `${medication.id}-${time}`,
          medicationId: medication.id,
          name: medication.name,
          description: medication.description,
          image: medication.image,
          time: time,
          taken: log ? log.taken : false
        })
      })
    } else if (medSchedule.type === 'cyclical') {
      // サイクルパターンが正しく設定されているかチェック
      if (!medSchedule.cyclePattern || !medSchedule.cyclePattern.activeDays || !medSchedule.cyclePattern.breakDays) {
        return
      }
      
      const startDate = new Date(medSchedule.startDate)
      const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
      const cycleLength = medSchedule.cyclePattern.activeDays + medSchedule.cyclePattern.breakDays
      const currentCycle = Math.floor(daysSinceStart / cycleLength)
      
      // 総サイクル数を超えていないかチェック
      if (currentCycle >= medSchedule.cyclePattern.totalCycles) {
        return
      }
      
      const dayInCycle = daysSinceStart % cycleLength
      
      if (dayInCycle < medSchedule.cyclePattern.activeDays) {
        medSchedule.times.forEach(time => {
          const log = medicationLogs.find(log => 
            log.medicationId === medication.id && 
            log.date === today && 
            log.time === time
          )
          
          schedule.push({
            id: `${medication.id}-${time}`,
            medicationId: medication.id,
            name: medication.name,
            description: medication.description,
            image: medication.image,
            time: time,
            taken: log ? log.taken : false,
            cycleInfo: {
              currentCycle: currentCycle + 1,
              dayInActivePeriod: dayInCycle + 1,
              totalCycles: medSchedule.cyclePattern.totalCycles
            }
          })
        })
      }
    }
  })
  
  return schedule.sort((a, b) => a.time.localeCompare(b.time))
})

const adherenceRate = computed(() => {
  if (todaySchedule.value.length === 0) return 0
  const takenCount = todaySchedule.value.filter(item => item.taken).length
  return Math.round((takenCount / todaySchedule.value.length) * 100)
})

const adherenceRateColor = computed(() => {
  if (adherenceRate.value === 100) return 'text-success-600'
  if (adherenceRate.value >= 80) return 'text-yellow-600'
  return 'text-red-600'
})

const isPastTime = (time) => {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)
  const scheduleTime = new Date()
  scheduleTime.setHours(hours, minutes, 0, 0)
  return now > scheduleTime
}

const toggleMedication = (item) => {
  const existingLog = medicationLogs.find(log => 
    log.medicationId === item.medicationId && 
    log.date === today && 
    log.time === item.time
  )
  
  if (existingLog) {
    existingLog.taken = !existingLog.taken
    existingLog.timestamp = new Date().toISOString()
  } else {
    medicationLogs.push({
      id: Date.now(),
      medicationId: item.medicationId,
      date: today,
      time: item.time,
      taken: true,
      timestamp: new Date().toISOString()
    })
  }
  
  item.taken = !item.taken
}
</script>