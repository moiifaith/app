import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const API_BASE = '/api'

// Global auth state
const isAuthenticated = ref(false)
const user = ref(null)
const token = ref(null)

export function useAuth() {
  const initAuth = async () => {
    try {
      const { value: storedToken } = await Preferences.get({ key: 'auth_token' })
      
      if (storedToken) {
        token.value = storedToken
        
        // Verify token with server
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          user.value = userData.data.user
          isAuthenticated.value = true
        } else {
          // Token is invalid, clear it
          await clearAuth()
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      await clearAuth()
    }
  }

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        token.value = data.token
        user.value = data.user
        isAuthenticated.value = true

        // Store token securely
        await Preferences.set({
          key: 'auth_token',
          value: data.token
        })

        // Store user data
        await Preferences.set({
          key: 'user_data',
          value: JSON.stringify(data.user)
        })

        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        token.value = data.token
        user.value = data.user
        isAuthenticated.value = true

        // Store token securely
        await Preferences.set({
          key: 'auth_token',
          value: data.token
        })

        // Store user data
        await Preferences.set({
          key: 'user_data',
          value: JSON.stringify(data.user)
        })

        return { success: true }
      } else {
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        // Notify server of logout
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await clearAuth()
    }
  }

  const clearAuth = async () => {
    token.value = null
    user.value = null
    isAuthenticated.value = false

    // Clear stored data
    await Preferences.remove({ key: 'auth_token' })
    await Preferences.remove({ key: 'user_data' })
  }

  const getAuthHeaders = () => {
    return token.value ? {
      'Authorization': `Bearer ${token.value}`
    } : {}
  }

  const isAdmin = () => {
    return user.value?.role === 'admin'
  }

  return {
    // State
    isAuthenticated,
    user,
    token,
    
    // Methods
    initAuth,
    login,
    register,
    logout,
    clearAuth,
    getAuthHeaders,
    isAdmin
  }
}
