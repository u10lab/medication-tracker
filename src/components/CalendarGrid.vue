<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">{{ currentMonth }}</h2>
      <div class="flex space-x-2">
        <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-lg">
          ←
        </button>
        <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg">
          →
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1 mb-4">
      <div v-for="day in weekDays" :key="day" class="p-2 text-center text-sm font-medium text-gray-500">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="date in calendarDates"
        :key="date.key"
        class="min-h-[80px] p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        :class="{
          'bg-gray-50 text-gray-400': !date.isCurrentMonth,
          'bg-primary-50 border-primary-200': date.isToday,
          'bg-success-50 border-success-200': date.adherenceRate === 100,
          'bg-yellow-50 border-yellow-200': date.adherenceRate > 0 && date.adherenceRate < 100,
          'bg-red-50 border-red-200': date.adherenceRate === 0 && date.hasMedications
        }"
        @click="selectDate(date)"
      >
        <div class="text-sm font-medium mb-1">{{ date.day }}</div>
        <div v-if="date.medications.length > 0" class="space-y-1">
          <div
            v-for="med in date.medications.slice(0, 2)"
            :key="med.id"
            class="text-xs px-2 py-1 rounded-full"
            :class="{
              'bg-success-100 text-success-700': med.taken,
              'bg-red-100 text-red-700': !med.taken && date.isPast,
              'bg-gray-100 text-gray-600': !med.taken && !date.isPast
            }"
          >
            {{ med.name }}
          </div>
          <div v-if="date.medications.length > 2" class="text-xs text-gray-500">
            +{{ date.medications.length - 2 }}個
          </div>
        </div>
      </div>
    </div>

    <!-- 選択された日付の詳細 -->
    <div v-if="selectedDate" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 class="font-medium text-gray-900 mb-3">
        {{ formatSelectedDate(selectedDate) }} の服薬予定
      </h3>
      <div class="space-y-2">
        <div
          v-for="med in selectedDate.medications"
          :key="med.id"
          class="flex items-center justify-between p-3 bg-white rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full"
              :class="{
                'bg-success-500': med.taken,
                'bg-red-500': !med.taken && selectedDate.isPast,
                'bg-gray-300': !med.taken && !selectedDate.isPast
              }"
            ></div>
            <div>
              <div class="font-medium">{{ med.name }}</div>
              <div class="text-sm text-gray-500">{{ med.time }}</div>
            </div>
          </div>
          <button
            v-if="!selectedDate.isPast || !med.taken"
            @click="toggleMedication(med)"
            class="px-3 py-1 text-sm rounded-lg"
            :class="med.taken ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-success-100 text-success-700 hover:bg-success-200'"
          >
            {{ med.taken ? '未服薬にする' : '服薬済みにする' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { medications, medicationLogs } from '../data/mockData.js'

const currentDate = ref(new Date())
const selectedDate = ref(null)

const weekDays = ['日', '月', '火', '水', '木', '金', '土']

const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long' 
  })
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dateString = date.toISOString().split('T')[0]
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.getTime() === today.getTime()
    const isPast = date < today
    
    // その日の薬物スケジュールを取得
    const dayMedications = getMedicationsForDate(dateString)
    
    // 服薬率を計算
    let adherenceRate = 0
    if (dayMedications.length > 0) {
      const takenCount = dayMedications.filter(med => med.taken).length
      adherenceRate = Math.round((takenCount / dayMedications.length) * 100)
    }
    
    dates.push({
      key: `${year}-${month}-${i}`,
      date: date,
      day: date.getDate(),
      dateString: dateString,
      isCurrentMonth: isCurrentMonth,
      isToday: isToday,
      isPast: isPast,
      medications: dayMedications,
      adherenceRate: adherenceRate,
      hasMedications: dayMedications.length > 0
    })
  }
  
  return dates
})

const getMedicationsForDate = (dateString) => {
  const dayMedications = []
  
  medications.forEach(medication => {
    const schedule = medication.schedule
    const date = new Date(dateString)
    
    // 開始日と終了日をチェック
    if (date < new Date(schedule.startDate) || date > new Date(schedule.endDate)) {
      return
    }
    
    // スケジュールタイプに応じて処理
    if (schedule.type === 'daily') {
      // 毎日のスケジュール
      schedule.times.forEach(time => {
        const log = medicationLogs.find(log => 
          log.medicationId === medication.id && 
          log.date === dateString && 
          log.time === time
        )
        
        dayMedications.push({
          id: `${medication.id}-${time}`,
          medicationId: medication.id,
          name: medication.name,
          time: time,
          taken: log ? log.taken : false
        })
      })
    } else if (schedule.type === 'cyclical') {
      // サイクルスケジュール
      const startDate = new Date(schedule.startDate)
      const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24))
      
      // サイクルパターンが正しく設定されているかチェック
      if (!schedule.cyclePattern || !schedule.cyclePattern.activeDays || !schedule.cyclePattern.breakDays) {
        return
      }
      
      const cycleLength = schedule.cyclePattern.activeDays + schedule.cyclePattern.breakDays
      const currentCycle = Math.floor(daysSinceStart / cycleLength)
      
      // 総サイクル数を超えていないかチェック
      if (currentCycle >= schedule.cyclePattern.totalCycles) {
        return
      }
      
      const dayInCycle = daysSinceStart % cycleLength
      
      // アクティブ期間内かチェック
      if (dayInCycle < schedule.cyclePattern.activeDays) {
        schedule.times.forEach(time => {
          const log = medicationLogs.find(log => 
            log.medicationId === medication.id && 
            log.date === dateString && 
            log.time === time
          )
          
          dayMedications.push({
            id: `${medication.id}-${time}`,
            medicationId: medication.id,
            name: medication.name,
            time: time,
            taken: log ? log.taken : false,
            cycleInfo: {
              currentCycle: currentCycle + 1,
              dayInActivePeriod: dayInCycle + 1,
              totalCycles: schedule.cyclePattern.totalCycles
            }
          })
        })
      }
    }
  })
  
  return dayMedications.sort((a, b) => a.time.localeCompare(b.time))
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  selectedDate.value = date
}

const formatSelectedDate = (date) => {
  return date.date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })
}

const toggleMedication = (med) => {
  const existingLog = medicationLogs.find(log => 
    log.medicationId === med.medicationId && 
    log.date === selectedDate.value.dateString && 
    log.time === med.time
  )
  
  if (existingLog) {
    existingLog.taken = !existingLog.taken
    existingLog.timestamp = new Date().toISOString()
  } else {
    medicationLogs.push({
      id: Date.now(),
      medicationId: med.medicationId,
      date: selectedDate.value.dateString,
      time: med.time,
      taken: true,
      timestamp: new Date().toISOString()
    })
  }
  
  // 表示を更新
  med.taken = !med.taken
  
  // 服薬率を再計算
  const takenCount = selectedDate.value.medications.filter(m => m.taken).length
  selectedDate.value.adherenceRate = Math.round((takenCount / selectedDate.value.medications.length) * 100)
}

onMounted(() => {
  // 今日の日付を選択
  const today = calendarDates.value.find(date => date.isToday)
  if (today) {
    selectedDate.value = today
  }
})
</script>