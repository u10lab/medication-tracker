import axios from 'axios'

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Sanctum CSRF protection
})

// Request interceptor to add auth token
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

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('laravel_token')
      // Redirect to login or refresh token
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
        const response = await apiClient.post('/auth/token', {
          supabase_user_id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.name || supabaseUser.email,
        })
        return response.data
      } catch (error) {
        console.error('Error getting API token:', error)
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

  // Medications endpoints (placeholder for future implementation)
  medications: {
    getAll: async () => {
      try {
        const response = await apiClient.get('/medications')
        return response.data
      } catch (error) {
        console.error('Error getting medications:', error)
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