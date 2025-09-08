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
import { ref, computed, onMounted } from 'vue'
import { apiService } from '../services/api.js'

const medications = ref([])
const medicationLogs = ref([])
const loading = ref(false)

const today = new Date().toISOString().split('T')[0]

const todaySchedule = computed(() => {
  const schedule = []
  
  medications.value.forEach(medication => {
    // 現在のAPI構造では、medication_patterns を別途取得する必要がある
    if (medication.patterns && medication.patterns.length > 0) {
      medication.patterns.forEach(pattern => {
        const date = new Date(today)
        
        // 開始日と終了日をチェック
        const startDate = new Date(pattern.start_date)
        const endDate = pattern.end_date ? new Date(pattern.end_date) : new Date('2099-12-31')
        if (date < startDate || date > endDate) {
          return
        }
        
        // スケジュールタイプに応じて処理
        if (pattern.pattern_type === 'daily' && pattern.times) {
          pattern.times.forEach(time => {
            const log = medicationLogs.value.find(log => 
              log.medication_id === medication.id && 
              log.scheduled_date === today && 
              log.scheduled_time === time + ':00'
            )
            
            schedule.push({
              id: `${pattern.id}-${time}`,
              medicationId: medication.id,
              patternId: pattern.id,
              name: medication.name,
              description: medication.description,
              image: medication.image_path,
              time: time,
              taken: log ? (log.status === 'taken') : false
            })
          })
        }
      })
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

const toggleMedication = async (item) => {
  try {
    const existingLog = medicationLogs.value.find(log => 
      log.medication_id === item.medicationId && 
      log.scheduled_date === today && 
      log.scheduled_time === item.time + ':00'
    )
    
    if (existingLog) {
      // 既存のログを更新
      const newStatus = existingLog.status === 'taken' ? 'missed' : 'taken'
      const updateData = {
        status: newStatus,
        actual_time: newStatus === 'taken' ? new Date().toISOString() : null
      }
      
      const response = await apiService.logs.update(existingLog.id, updateData)
      if (response.success) {
        existingLog.status = newStatus
        existingLog.actual_time = updateData.actual_time
      }
    } else {
      // 新しいログを作成
      const logData = {
        medication_id: item.medicationId,
        scheduled_date: today,
        scheduled_time: item.time + ':00',
        status: 'taken',
        actual_time: new Date().toISOString()
      }
      
      const response = await apiService.logs.create(logData)
      if (response.success && response.data) {
        medicationLogs.value.push(response.data)
      }
    }
    
    // 表示を更新
    item.taken = !item.taken
  } catch (error) {
    console.error('Error updating medication log:', error)
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    
    // APIから処方薬データを取得
    const medicationsResponse = await apiService.medications.getAll()
    if (medicationsResponse.success && medicationsResponse.data) {
      medications.value = medicationsResponse.data
      
      // 各medicationに対してpatternsを取得
      // 服薬パターンは削除されたため、処方薬のスケジュール情報を直接使用
      for (const medication of medications.value) {
        // 処方薬のスケジュール情報をパターンとして使用
        if (medication.schedule && medication.schedule.times) {
          medication.patterns = [{
            id: medication.id,
            pattern_type: medication.schedule.type || 'daily',
            times: medication.schedule.times,
            start_date: medication.schedule.startDate,
            end_date: medication.schedule.endDate
          }]
        } else {
          medication.patterns = []
        }
      }
    }
    
    // APIから服薬ログデータを取得
    const logsResponse = await apiService.logs.getAll()
    if (logsResponse.success && logsResponse.data) {
      medicationLogs.value = logsResponse.data
    }
    
  } catch (error) {
    console.error('Error fetching daily schedule data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>