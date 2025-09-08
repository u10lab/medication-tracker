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
        const response = await apiClient.post('/auth/token', {
          supabase_token: supabaseUser.access_token || supabaseUser.id, // Supabase JWT token
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