<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="login-card">
        <h1>{{ $t('admin.loginTitle') }}</h1>
        <p>{{ $t('admin.loginDescription') }}</p>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">{{ $t('admin.username') }}</label>
            <input 
              type="text" 
              id="username"
              v-model="credentials.username" 
              required
              :placeholder="$t('admin.usernamePlaceholder')"
            />
          </div>
          
          <div class="form-group">
            <label for="password">{{ $t('admin.password') }}</label>
            <input 
              type="password" 
              id="password"
              v-model="credentials.password" 
              required
              :placeholder="$t('admin.passwordPlaceholder')"
            />
          </div>
          
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? $t('admin.loggingIn') : $t('admin.login') }}
          </button>
        </form>
        
        <div class="login-footer">
          <router-link to="/" class="back-to-app">
            ← {{ $t('admin.backToApp') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      error: '',
      isLoading: false
    }
  },
  mounted() {
    // Check if already logged in
    if (localStorage.getItem('adminToken')) {
      this.$router.push('/admin')
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true
      this.error = ''
      
      try {
        // For demo purposes, use simple hardcoded credentials
        // In production, this would call your Cloudflare Functions API
        if (this.credentials.username === 'admin' && this.credentials.password === 'zikr2024') {
          // Generate a simple token (in production, this would come from your API)
          const token = btoa(`${this.credentials.username}:${Date.now()}`)
          localStorage.setItem('adminToken', token)
          localStorage.setItem('adminUser', this.credentials.username)
          
          this.$router.push('/admin')
        } else {
          this.error = this.$t('admin.invalidCredentials')
        }
      } catch (error) {
        this.error = this.$t('admin.loginError')
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 15px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.login-card h1 {
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.login-card p {
  color: #6c757d;
  margin: 0 0 30px 0;
  line-height: 1.6;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.login-btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.login-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.login-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.back-to-app {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-to-app:hover {
  color: #5a6fd8;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-card h1 {
    font-size: 1.5rem;
  }
}
</style>