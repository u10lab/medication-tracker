import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// axios.createは、axiosのインスタンスを作成するための関数
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, 
  // Laravel SanctumのようなCookieベースのCSRF（クロスサイトリクエストフォージェリ）保護を使用する場合に重要な設定
})

// デバッグ用: API設定をコンソールに出力
console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE
})


// 役割: APIにリクエストを送る直前に、自動で認証トークンをヘッダーに付与。
// 仕組み:
// 1.apiClientでリクエストが発生するたびに、この関数が実行。
// localStorageから 'laravel_token' を探し出す。
// もしトークンが存在すれば、リクエストの設定オブジェクト (config) のヘッダーに Authorization: 'Bearer [トークンの値]' という形式で追加。
// 最後に、変更が加えられたconfigを返して、リクエストの送信を続行させる。
// 利点: これにより、APIを呼び出す全ての関数で認証ヘッダーを付与するコードを書く必要がなくなり、非常にクリーンに。
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('laravel_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 1. APIからエラー応答が返ってくると、この関数の第2引数が実行。
// 2. error.response?.status === 401: エラーのステータスコードが401 Unauthorized（認証失敗・トークン切れ）かどうかをチェック。
// 3. もし401エラーなら、以下の処理を実行。
// 4. localStorage.removeItem('laravel_token'): 無効になったトークンを削除。
// 5. window.location.href = '/login': ユーザーを強制的にログインページにリダイレクトさせる。
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('laravel_token')
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API service methods
export const apiService = {
  // Auth endpoints
  auth: {
    // Get Laravel API token using Supabase user info
    getToken: async (supabaseUser) => {
      try {
        console.log('🔧 API getToken request:', {
          supabaseUser: supabaseUser,
          token: supabaseUser.supabase_token || supabaseUser.access_token || supabaseUser.id
        })
        
        const response = await apiClient.post('/auth/token', {
          supabase_token: supabaseUser.supabase_token || supabaseUser.access_token || supabaseUser.id
        })
        return response.data
      } catch (error) {
        console.error('Error getting API token:', error)
        if (error.response) {
          console.error('Response data:', error.response.data)
          console.error('Response status:', error.response.status)
        }
        throw error
      }
    },

    // Revoke current token
    revokeToken: async () => {
      try {
        const response = await apiClient.post('/auth/revoke')
        localStorage.removeItem('laravel_token')
        return response.data
      } catch (error) {
        console.error('Error revoking token:', error)
        throw error
      }
    },

    // Get current user from Laravel API
    getUser: async () => {
      try {
        const response = await apiClient.get('/user')
        return response.data
      } catch (error) {
        console.error('Error getting user:', error)
        throw error
      }
    }
  },

  // Medications endpoints
  medications: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/medications')
        return response.data
      } catch (error) {
        console.error('Error getting medications:', error)
        throw error
      }
    },

    getById: async (id) => {
      try {
        const response = await apiClient.get(`/medications/${id}`)
        return response.data
      } catch (error) {
        console.error('Error getting medication:', error)
        throw error
      }
    },

    create: async (medicationData) => {
      try {
        const response = await apiClient.post('/medications', medicationData)
        return response.data
      } catch (error) {
        console.error('Error creating medication:', error)
        throw error
      }
    },

    update: async (id, medicationData) => {
      try {
        const response = await apiClient.put(`/medications/${id}`, medicationData)
        console.log('Update response:', response.data)
        return response.data
      } catch (error) {
        console.error('Error updating medication:', error)
        if (error.response && error.response.data) {
          console.error('Validation errors:', error.response.data)
        }
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/medications/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting medication:', error)
        throw error
      }
    }
  },

  // Medication Patterns endpoints (removed - using medication schedule directly)

  // Medication Logs endpoints
  logs: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/medication-logs')
        return response.data
      } catch (error) {
        console.error('Error getting medication logs:', error)
        throw error
      }
    },

    create: async (logData) => {
      try {
        const response = await apiClient.post('/medication-logs', logData)
        return response.data
      } catch (error) {
        console.error('Error creating medication log:', error)
        throw error
      }
    },

    update: async (id, logData) => {
      try {
        const response = await apiClient.put(`/medication-logs/${id}`, logData)
        return response.data
      } catch (error) {
        console.error('Error updating medication log:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/medication-logs/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting medication log:', error)
        throw error
      }
    }
  },

  // Side Effects endpoints  
  sideEffects: {
    getTypes: async () => {
      try {
        const response = await apiClient.get('/side-effect-types')
        return response.data
      } catch (error) {
        console.error('Error getting side effect types:', error)
        throw error
      }
    }
  }
}

// Utility function to set token
export const setApiToken = (token) => {
  localStorage.setItem('laravel_token', token)
}

// Utility function to remove token
export const removeApiToken = () => {
  localStorage.removeItem('laravel_token')
}

export default apiClient