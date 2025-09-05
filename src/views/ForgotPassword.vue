<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100">
          <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          パスワードリセット
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          メールアドレスを入力してください<br>
          リセット用のメールをお送りします
        </p>
      </div>
      
      <form @submit.prevent="handleResetPassword" class="mt-8 space-y-6">
        <div>
          <label for="email" class="sr-only">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
            placeholder="メールアドレス"
          />
        </div>

        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                {{ success }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !!success"
            class="group relative flex w-full justify-center rounded-md bg-yellow-600 py-2 px-3 text-sm font-semibold text-white hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 disabled:opacity-50"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            </span>
            {{ loading ? '送信中...' : success ? '送信完了' : 'リセットメールを送信' }}
          </button>
        </div>

        <div class="text-center space-y-2">
          <div>
            <router-link to="/login" class="font-medium text-yellow-600 hover:text-yellow-500">
              ← ログイン画面に戻る
            </router-link>
          </div>
          <div class="text-sm text-gray-600">
            アカウントをお持ちでない方は
            <router-link to="/register" class="font-medium text-yellow-600 hover:text-yellow-500">
              新規登録
            </router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const form = ref({
  email: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleResetPassword = async () => {
  if (!form.value.email) {
    error.value = 'メールアドレスを入力してください'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { error: resetError } = await authStore.resetPassword(form.value.email)
    
    if (resetError) {
      error.value = 'パスワードリセットメールの送信に失敗しました'
      return
    }

    success.value = 'パスワードリセット用のメールを送信しました。メールをご確認ください。'
    
  } catch (err) {
    console.error('Password reset error:', err)
    error.value = 'パスワードリセット処理中にエラーが発生しました'
  } finally {
    loading.value = false
  }
}
</script>