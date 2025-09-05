import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
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
      supabase.auth.onAuthStateChange((event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
        loading.value = false
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
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
          data: metadata
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
    
    // Getters
    isAuthenticated,
    userEmail,
    userName,
    
    // Actions
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }
})