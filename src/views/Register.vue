<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>{{ $t('auth.register.title') }}</h1>
        <p>{{ $t('auth.register.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">{{ $t('auth.email') }}</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">{{ $t('auth.password') }}</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            :placeholder="$t('auth.passwordPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">{{ $t('auth.confirmPassword') }}</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="name">{{ $t('auth.name') }}</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            :placeholder="$t('auth.namePlaceholder')"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.migrateData"
              :disabled="loading"
            />
            <span class="checkmark"></span>
            {{ $t('auth.register.migrateData') }}
          </label>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="register-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? $t('auth.registering') : $t('auth.register.button') }}
        </button>
      </form>

      <div class="auth-links">
        <p>
          {{ $t('auth.alreadyHaveAccount') }}
          <router-link to="/login">{{ $t('auth.login.button') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { migrateLocalStorageData } from '@/utils/dataMigration'

export default {
  name: 'UserRegister',
  setup() {
    const router = useRouter()
    const { register } = useAuth()
    const loading = ref(false)
    const error = ref('')

    const form = reactive({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      migrateData: true
    })

    const handleRegister = async () => {
      if (form.password !== form.confirmPassword) {
        error.value = 'Passwords do not match'
        return
      }

      if (form.password.length < 8) {
        error.value = 'Password must be at least 8 characters long'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const result = await register({
          email: form.email,
          password: form.password,
          name: form.name
        })

        if (result.success) {
          // Migrate local storage data if requested
          if (form.migrateData) {
            await migrateLocalStorageData()
          }
          
          router.push('/zikr-app')
        } else {
          error.value = result.error || 'Registration failed'
        }
      } catch (err) {
        error.value = 'Network error. Please try again.'
        console.error('Registration error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  background: white;
  border-radius: 15px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 600;
}

.register-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.checkbox-group {
  margin-bottom: 25px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #e1e5e9;
  border-radius: 3px;
  margin-right: 10px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
  font-size: 14px;
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-links {
  text-align: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid #e1e5e9;
}

.auth-links p {
  color: #666;
  margin: 0;
}

.auth-links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-container {
    padding: 30px 20px;
  }
  
  .register-header h1 {
    font-size: 1.8rem;
  }
}
</style>
