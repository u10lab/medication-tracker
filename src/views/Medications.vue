<template>
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

    <!-- 処方薬一覧 -->
    <div v-if="medications.length === 0" class="text-center py-12">
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
import { ref } from 'vue'
import MedicationCard from '../components/MedicationCard.vue'
import MedicationForm from '../components/MedicationForm.vue'
import { medications } from '../data/mockData.js'

const showForm = ref(false)
const editingMedication = ref(null)
const showDeleteDialog = ref(false)
const deletingMedication = ref(null)

const editMedication = (medication) => {
  editingMedication.value = medication
  showForm.value = true
}

const deleteMedication = (medicationId) => {
  deletingMedication.value = medications.find(med => med.id === medicationId)
  showDeleteDialog.value = true
}

const closeForm = () => {
  showForm.value = false
  editingMedication.value = null
}

const saveMedication = (medicationData) => {
  if (editingMedication.value) {
    // 編集
    const index = medications.findIndex(med => med.id === editingMedication.value.id)
    if (index !== -1) {
      medications[index] = { ...medicationData, id: editingMedication.value.id }
    }
  } else {
    // 新規追加
    const newMedication = {
      ...medicationData,
      id: Date.now()
    }
    medications.push(newMedication)
  }
  
  closeForm()
}

const confirmDelete = () => {
  if (deletingMedication.value) {
    const index = medications.findIndex(med => med.id === deletingMedication.value.id)
    if (index !== -1) {
      medications.splice(index, 1)
    }
  }
  showDeleteDialog.value = false
  deletingMedication.value = null
}
</script>