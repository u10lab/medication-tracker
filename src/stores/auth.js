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
      })
      
      // If user is already authenticated, setup API access
      if (initialSession?.user) {
        await setupApiAccess(initialSession.user)
      }
      
      // Set loading to false after initial setup
      loading.value = false
    } catch (error) {
      console.error('Error initializing auth:', error)
      loading.value = false
    }
  }

  // Setup API access with Laravel token
  const setupApiAccess = async (supabaseUser) => {
    try {
      // Supabase セッションからアクセストークンを取得
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Supabase session:', session)
      
      if (!session?.access_token) {
        console.error('No Supabase access token available')
        throw new Error('No Supabase access token available')
      }
      
      console.log('Sending to Laravel API:', {
        access_token: session.access_token.substring(0, 20) + '...',
        id: supabaseUser.id,
        email: supabaseUser.email
      })
      
      const { user: laravelUserData, token } = await apiService.auth.getToken({
        access_token: session.access_token,
        id: supabaseUser.id,
        email: supabaseUser.email
      })
      
      apiToken.value = token
      laravelUser.value = laravelUserData
      setApiToken(token)
      console.log('Laravel API access established')
    } catch (error) {
      console.error('Failed to setup API access:', error)
      // エラーが発生しても認証状態は維持する
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
      
      // Clear states first to prevent null reference errors
      user.value = null
      session.value = null
      
      // Clear API access
      await clearApiAccess()
      
      // Supabase signout (with error handling)
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.warn('Supabase signout warning:', error)
        }
      } catch (supabaseError) {
        console.warn('Supabase signout failed, continuing with local cleanup:', supabaseError)
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear local state
      user.value = null
      session.value = null
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