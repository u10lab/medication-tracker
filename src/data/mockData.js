import { reactive } from 'vue'

// 処方薬データ
export const medications = reactive([
  {
    id: 1,
    name: 'アスピリン',
    description: '血液をサラサラにする薬',
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    schedule: {
      type: 'daily',
      dosesPerDay: 1,
      times: ['08:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  },
  {
    id: 2,
    name: 'メトホルミン',
    description: '糖尿病治療薬',
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    schedule: {
      type: 'daily',
      dosesPerDay: 2,
      times: ['08:00', '20:00'],
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  },
  {
    id: 3,
    name: 'プレドニゾロン',
    description: 'ステロイド薬（2週間服薬→1週間休薬を18サイクル）',
    image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
    schedule: {
      type: 'cyclical',
      dosesPerDay: 2,
      times: ['08:00', '20:00'],
      cyclePattern: {
        activeDays: 14,
        breakDays: 7,
        totalCycles: 18
      },
      startDate: '2024-01-01',
      endDate: '2025-12-31'
    }
  }
])

// 服薬記録
export const medicationLogs = reactive([
  // 今日の記録
  {
    id: 1,
    medicationId: 1,
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    taken: true,
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    medicationId: 2,
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    taken: true,
    timestamp: new Date().toISOString()
  },
  // 過去の記録（サンプル）
  {
    id: 3,
    medicationId: 1,
    date: '2024-12-19',
    time: '08:00',
    taken: true,
    timestamp: '2024-12-19T08:00:00Z'
  },
  {
    id: 4,
    medicationId: 2,
    date: '2024-12-19',
    time: '08:00',
    taken: false,
    timestamp: '2024-12-19T08:00:00Z'
  }
])

// 副作用記録
export const sideEffects = reactive([
  {
    id: 1,
    medicationId: 1,
    date: '2024-12-19',
    time: '10:30',
    symptoms: ['頭痛', '吐き気'],
    severity: 'mild',
    notes: '朝食後30分で軽い頭痛が発生。水分補給で改善。',
    timestamp: '2024-12-19T10:30:00Z'
  },
  {
    id: 2,
    medicationId: 3,
    date: '2024-12-18',
    time: '14:00',
    symptoms: ['めまい', '疲労感'],
    severity: 'moderate',
    notes: 'ステロイド開始3日目。午後に強いめまいと疲労感。',
    timestamp: '2024-12-18T14:00:00Z'
  }
])

// 共通の副作用症状リスト
export const commonSymptoms = [
  '頭痛', '吐き気', 'めまい', '疲労感', '発疹', '下痢', '便秘', 
  '食欲不振', '不眠', '眠気', '口の渇き', '動悸', '息切れ', 
  '筋肉痛', '関節痛', 'その他'
]

// 重症度オプション
export const severityOptions = [
  { value: 'mild', label: '軽度', color: 'text-green-600' },
  { value: 'moderate', label: '中等度', color: 'text-yellow-600' },
  { value: 'severe', label: '重度', color: 'text-red-600' }
]