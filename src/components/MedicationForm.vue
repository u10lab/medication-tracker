<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEdit ? '処方薬情報を編集' : '新しい処方薬を追加' }}
          </h2>
          <button 
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 基本情報 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">基本情報</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">処方薬名</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="処方薬名を入力"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="処方薬の説明を入力"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
              <input
                v-model="form.image"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/image.jpg"
              >
              <div v-if="form.image" class="mt-2">
                <img :src="form.image" alt="プレビュー" class="w-20 h-20 rounded-lg object-cover">
              </div>
            </div>
          </div>

          <!-- スケジュール設定 -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">服薬スケジュール</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">スケジュールタイプ</label>
              <select
                v-model="form.schedule.type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">毎日</option>
                <option value="cyclical">サイクル</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">1日の服薬回数</label>
              <input
                v-model.number="form.schedule.dosesPerDay"
                type="number"
                min="1"
                max="10"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">服薬時間</label>
              <div class="space-y-2">
                <div v-for="(time, index) in form.schedule.times" :key="index" class="flex items-center space-x-2">
                  <input
                    v-model="form.schedule.times[index]"
                    type="time"
                    required
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <button
                    v-if="form.schedule.times.length > 1"
                    @click="removeTime(index)"
                    type="button"
                    class="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
                <button
                  v-if="form.schedule.times.length < form.schedule.dosesPerDay"
                  @click="addTime"
                  type="button"
                  class="text-primary-600 hover:text-primary-700 text-sm"
                >
                  + 時間を追加
                </button>
              </div>
            </div>

            <!-- サイクル設定（cyclicalの場合のみ表示） -->
            <div v-if="form.schedule.type === 'cyclical'" class="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-900">サイクル設定</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">1回あたりの服薬日数</label>
                  <input
                    v-model.number="form.schedule.cyclePattern.activeDays"
                    type="number"
                    min="1"
                    max="365"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="例: 14（2週間）"
                  >
                  <p class="text-xs text-gray-500 mt-1">連続して薬を飲む日数を入力してください</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">休薬日数</label>
                  <input
                    v-model.number="form.schedule.cyclePattern.breakDays"
                    type="number"
                    min="0"
                    max="365"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="例: 7（1週間）"
                  >
                  <p class="text-xs text-gray-500 mt-1">薬を飲まない日数を入力してください</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">総サイクル数</label>
                  <input
                    v-model.number="form.schedule.cyclePattern.totalCycles"
                    type="number"
                    min="1"
                    max="100"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="例: 18"
                  >
                  <p class="text-xs text-gray-500 mt-1">このパターンを何回繰り返すかを入力してください</p>
                </div>
              </div>
              
              <!-- サイクル説明 -->
              <div class="p-3 bg-blue-50 rounded-lg">
                <h5 class="text-sm font-medium text-blue-900 mb-2">設定内容の確認</h5>
                <p class="text-sm text-blue-800">
                  {{ form.schedule.cyclePattern.activeDays }}日間服薬 → 
                  {{ form.schedule.cyclePattern.breakDays }}日間休薬を
                  {{ form.schedule.cyclePattern.totalCycles }}回繰り返します
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  総期間: 約{{ Math.ceil((form.schedule.cyclePattern.activeDays + form.schedule.cyclePattern.breakDays) * form.schedule.cyclePattern.totalCycles / 30) }}ヶ月
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">開始日</label>
                <input
                  v-model="form.schedule.startDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">終了日</label>
                <input
                  v-model="form.schedule.endDate"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
            </div>
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
              {{ isEdit ? '更新' : '追加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  medication: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const isEdit = ref(!!props.medication)

const form = ref({
  name: '',
  description: '',
  image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
  schedule: {
    type: 'daily',
    dosesPerDay: 1,
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cyclePattern: {
      activeDays: 14,
      breakDays: 7,
      totalCycles: 1
    }
  }
})

// 編集モードの場合、既存データを設定
if (props.medication) {
  form.value = { 
    ...props.medication,
    // DBから取得したデータにはscheduleが含まれていないため、デフォルト値を設定
    schedule: props.medication.schedule || {
      type: 'daily',
      dosesPerDay: 1,
      times: ['08:00'],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cyclePattern: {
        activeDays: 14,
        breakDays: 7,
        totalCycles: 1
      }
    }
  }
}

// スケジュールタイプが変更されたときにcyclePatternを初期化
watch(() => form.value.schedule.type, (newType) => {
  if (newType === 'cyclical' && !form.value.schedule.cyclePattern) {
    form.value.schedule.cyclePattern = {
      activeDays: 14,
      breakDays: 7,
      totalCycles: 1
    }
  }
})

// 服薬回数が変更されたときに時間配列を調整
watch(() => form.value.schedule.dosesPerDay, (newCount, oldCount) => {
  const times = form.value.schedule.times
  if (newCount > oldCount) {
    // 時間を追加
    for (let i = oldCount; i < newCount; i++) {
      times.push('08:00')
    }
  } else if (newCount < oldCount) {
    // 時間を削除
    form.value.schedule.times = times.slice(0, newCount)
  }
})

const addTime = () => {
  form.value.schedule.times.push('08:00')
}

const removeTime = (index) => {
  form.value.schedule.times.splice(index, 1)
}

const handleSubmit = () => {
  console.log('Sending medication data:', { ...form.value })
  emit('save', { ...form.value })
}
</script>