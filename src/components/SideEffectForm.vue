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
              <label class="block text-sm font-medium text-gray-700 mb-2">処方薬</label>
              <select
                v-model="form.medicationId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">処方薬を選択</option>
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
import { ref, onMounted } from 'vue'
import { apiService } from '../services/api.js'

const emit = defineEmits(['close', 'save'])

const medications = ref([])
const commonSymptoms = ref([])
const severityOptions = [
  { value: 'mild', label: '軽度', color: 'text-green-600' },
  { value: 'moderate', label: '中等度', color: 'text-yellow-600' },
  { value: 'severe', label: '重度', color: 'text-red-600' }
]

const form = ref({
  medicationId: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  symptoms: [],
  severity: 'mild',
  notes: ''
})

const handleSubmit = async () => {
  try {
    const logData = {
      medication_id: parseInt(form.value.medicationId),
      scheduled_date: form.value.date,
      scheduled_time: form.value.time + ':00',
      status: 'taken',
      side_effects: [...form.value.symptoms],
      severity_level: form.value.severity,
      notes: form.value.notes
    }
    
    const response = await apiService.logs.create(logData)
    if (response.success) {
      console.log('副作用を記録しました')
      // フォームをリセット
      form.value = {
        medicationId: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        symptoms: [],
        severity: 'mild',
        notes: ''
      }
      // 処方薬名を取得
      const selectedMedication = medications.value.find(med => med.id === parseInt(logData.medication_id))
      const medicationName = selectedMedication ? selectedMedication.name : '不明な処方薬'
      
      // 作成されたデータを親コンポーネントに渡す
      emit('save', {
        id: response.data.id,
        medicationId: parseInt(logData.medication_id),
        medicationName: medicationName,
        date: logData.scheduled_date,
        time: logData.scheduled_time.substring(0, 5),
        symptoms: logData.side_effects,
        severity: logData.severity_level,
        notes: logData.notes,
        timestamp: new Date().toISOString()
      })
      emit('close')
    } else {
      alert('副作用記録の保存に失敗しました')
    }
  } catch (error) {
    console.error('Error saving side effect:', error)
    alert('副作用記録の保存に失敗しました')
  }
}


const fetchData = async () => {
  try {
    // 処方薬データを取得
    const medicationsResponse = await apiService.medications.getAll()
    if (medicationsResponse.success && medicationsResponse.data) {
      medications.value = medicationsResponse.data
      
      // 服薬パターンは削除されたため、処方薬のスケジュール情報を直接使用
    }
    
    // 副作用タイプを取得
    const sideEffectsResponse = await apiService.sideEffects.getTypes()
    if (sideEffectsResponse.success && sideEffectsResponse.data) {
      commonSymptoms.value = sideEffectsResponse.data.map(effect => effect.name)
    }
  } catch (error) {
    console.error('Error fetching form data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>