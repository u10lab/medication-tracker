<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">服薬カレンダー</h1>
      <p class="text-gray-600 mt-2">日付をクリックして服薬状況を記録・確認できます</p>
    </div>

    <!-- カレンダーの説明 -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-medium text-blue-900 mb-2">カレンダーの見方</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-success-200 border border-success-300"></div>
          <span class="text-blue-800">100%服薬</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-yellow-200 border border-yellow-300"></div>
          <span class="text-blue-800">部分的服薬</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-red-200 border border-red-300"></div>
          <span class="text-blue-800">未服薬</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-primary-200 border border-primary-300"></div>
          <span class="text-blue-800">今日</span>
        </div>
      </div>
    </div>

    <!-- カレンダーグリッド -->
    <CalendarGrid />
  </div>
</template>

<script setup>
import CalendarGrid from '../components/CalendarGrid.vue'
</script>