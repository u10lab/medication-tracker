import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { apiService, setApiToken, removeApiToken } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)
  const apiToken = ref(localStorage.getItem('laravel_token'))
  const laravelUser = ref(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const hasApiAccess = computed(() => !!apiToken.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.user_metadata?.name || user.value?.email || '')

  // Initialize auth state
  const initialize = async () => {
    try {
      loading.value = true
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      session.value = initialSession
      user.value = initialSession?.user || null

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          // Supabaseログイン時にLaravel APIトークンを取得
          await setupApiAccess(newSession.user)
        } else if (event === 'SIGNED_OUT') {
          // ログアウト時にAPIトークンをクリア
          await clearApiAccess()
        }
        
        loading.value = false
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Setup API access with Laravel token
  const setupApiAccess = async (supabaseUser) => {
    try {
      const { user: laravelUserData, token } = await apiService.auth.getToken(supabaseUser)
      apiToken.value = token
      laravelUser.value = laravelUserData
      setApiToken(token)
      console.log('Laravel API access established')
    } catch (error) {
      console.error('Failed to setup API access:', error)
    }
  }

  // Clear API access
  const clearApiAccess = async () => {
    try {
      if (apiToken.value) {
        await apiService.auth.revokeToken()
      }
    } catch (error) {
      console.error('Error revoking API token:', error)
    } finally {
      apiToken.value = null
      laravelUser.value = null
      removeApiToken()
    }
  }

  // Sign up
  const signUp = async (email, password, metadata = {}) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          // Skip email confirmation for development
          emailRedirectTo: undefined
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in:', error)
      return { data: null, error }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      loading.value = true
      
      // Clear API access first
      await clearApiAccess()
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      session.value = null
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error resetting password:', error)
      return { error }
    }
  }

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error updating password:', error)
      return { error }
    }
  }

  return {
    // State
    user,
    session,
    loading,
    apiToken,
    laravelUser,
    
    // Getters
    isAuthenticated,
    hasApiAccess,
    userEmail,
    userName,
    
    // Actions
    initialize,
    setupApiAccess,
    clearApiAccess,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }
})