800<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">処方薬管理</h1>
        <p class="text-gray-600 mt-2">処方薬の登録・編集・削除ができます</p>
      </div>
      <button
        @click="showForm = true"
        class="btn-primary flex items-center space-x-2"
      >
        <span>➕</span>
        <span>新しい処方薬を追加</span>
      </button>
    </div>

    <!-- ローディング表示 -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-6xl mb-4">⏳</div>
      <p class="text-gray-500">処方薬を読み込み中...</p>
    </div>

    <!-- エラー表示 -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-6xl mb-4">⚠️</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button @click="fetchMedications" class="btn-primary">再読み込み</button>
    </div>

    <!-- 処方薬一覧 -->
    <div v-else-if="medications.length === 0" class="text-center py-12">
      <div class="text-6xl mb-4">💊</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">処方薬が登録されていません</h3>
      <p class="text-gray-500 mb-6">最初の処方薬を追加して服薬管理を始めましょう</p>
      <button
        @click="showForm = true"
        class="btn-primary"
      >
        処方薬を追加
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MedicationCard
        v-for="medication in medications"
        :key="medication.id"
        :medication="medication"
        @edit="editMedication"
        @delete="deleteMedication"
      />
    </div>

    <!-- 処方薬フォーム -->
    <MedicationForm
      v-if="showForm"
      :medication="editingMedication"
      @close="closeForm"
      @save="saveMedication"
    />

    <!-- 削除確認ダイアログ -->
    <div v-if="showDeleteDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">処方薬を削除</h3>
        <p class="text-gray-600 mb-6">
          「{{ deletingMedication?.name }}」を削除しますか？<br>
          この操作は取り消せません。
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteDialog = false"
            class="btn-secondary"
          >
            キャンセル
          </button>
          <button
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MedicationCard from '../components/MedicationCard.vue'
import MedicationForm from '../components/MedicationForm.vue'
import { apiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const medications = ref([])
const loading = ref(true)
const error = ref(null)
const showForm = ref(false)
const editingMedication = ref(null)
const showDeleteDialog = ref(false)
const deletingMedication = ref(null)

// データ取得
const fetchMedications = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await apiService.medications.getAll()
    medications.value = response.data || []
  } catch (err) {
    error.value = '処方薬の取得に失敗しました'
    console.error('Error fetching medications:', err)
  } finally {
    loading.value = false
  }
}

// 初期化
onMounted(async () => {
  if (authStore.user) {
    await fetchMedications()
  }
})

const editMedication = (medication) => {
  editingMedication.value = medication
  showForm.value = true
}

const deleteMedication = (medicationId) => {
  deletingMedication.value = medications.value.find(med => med.id === medicationId)
  showDeleteDialog.value = true
}

const closeForm = () => {
  showForm.value = false
  editingMedication.value = null
}

const saveMedication = async (medicationData) => {
  try {
    if (editingMedication.value) {
      // 編集
      await apiService.medications.update(editingMedication.value.id, medicationData)
    } else {
      // 新規追加
      await apiService.medications.create(medicationData)
    }
    
    // 処方薬リスト再取得
    await fetchMedications()
    closeForm()
  } catch (err) {
    error.value = '処方薬の保存に失敗しました'
    console.error('Error saving medication:', err)
  }
}

const confirmDelete = async () => {
  if (deletingMedication.value) {
    try {
      await apiService.medications.delete(deletingMedication.value.id)
      await fetchMedications() // リスト再取得
    } catch (err) {
      error.value = '処方薬の削除に失敗しました'
      console.error('Error deleting medication:', err)
    }
  }
  showDeleteDialog.value = false
  deletingMedication.value = null
}
</script>