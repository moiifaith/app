<template>
  <div id="app">
    <!-- Only show navbar on landing page -->
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">
          Zikr Counter
        </router-link>
        
        <div class="nav-menu">
          <router-link to="/app" class="nav-link app-link">
            Open App
          </router-link>
          
          <div class="language-selector">
            <select @change="changeLanguage" :value="currentLanguage">
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="bs">Bosanski</option>
              <option value="hr">Hrvatski</option>
              <option value="sr">Српски</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
    
    <main class="main-content" :class="{ 'no-navbar': !showNavbar }">
      <router-view/>
    </main>
  </div>
</template>

<script>
import { setLanguage, getCurrentLanguage } from './i18n'

export default {
  name: 'App',
  data() {
    return {
      currentLanguage: getCurrentLanguage()
    }
  },
  computed: {
    showNavbar() {
      // Only show navbar on landing page
      return this.$route.path === '/'
    }
  },
  methods: {
    changeLanguage(event) {
      const newLanguage = event.target.value
      setLanguage(newLanguage)
      this.currentLanguage = newLanguage
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8f9fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  padding: 8px 16px;
  border-radius: 20px;
}

.nav-link:hover {
  color: #667eea;
}

.app-link {
  background: #667eea;
  color: white !important;
}

.app-link:hover {
  background: #5a6fd8;
  color: white !important;
}

.language-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
}

.main-content {
  min-height: calc(100vh - 80px);
}

.main-content.no-navbar {
  min-height: 100vh;
}

@media (max-width: 768px) {
  .nav-menu {
    gap: 15px;
    flex-wrap: wrap;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
