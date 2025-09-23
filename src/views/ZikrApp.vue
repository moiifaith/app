<template>
  <div class="zikr-app">
    <header class="app-header">
      <h1>{{ $t('zikr.appName') }}</h1>
      <div class="header-actions">
        <router-link 
          v-if="isAdmin" 
          to="/admin" 
          class="admin-btn"
        >
          {{ $t('admin.panel') || 'Admin Panel' }}
        </router-link>
        <button @click="showHistory" class="history-btn">
          {{ $t('zikr.history') }}
        </button>
        <button @click="handleLogout" class="logout-btn">
          {{ $t('auth.logout') || 'Logout' }}
        </button>
        <div class="language-selector">
          <select v-model="currentLanguage" @change="changeLanguage">
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
    </header>

    <main class="app-main">
      <!-- Today's Progress -->
      <section class="today-progress">
        <h2>{{ $t('zikr.todayProgress') }}</h2>
        <div class="progress-stats">
          <div class="stat">
            <span class="stat-number">{{ todayCompletedCount }}</span>
            <span class="stat-label">{{ $t('zikr.completed') }}</span>
          </div>
          <div class="stat">
            <span class="stat-number">{{ todayTotalCount }}</span>
            <span class="stat-label">{{ $t('zikr.total') }}</span>
          </div>
        </div>
      </section>

      <!-- Zikr List -->
      <section class="zikr-list">
        <h2>{{ $t('zikr.availableZikrs') }}</h2>
        <div class="zikr-grid">
          <div 
            v-for="zikr in zikrs" 
            :key="zikr.id"
            class="zikr-card"
            :class="{ completed: isZikrCompletedToday(zikr.id) }"
          >
            <div class="zikr-header">
              <h3 class="zikr-title-arabic">{{ zikr.arabic }}</h3>
              <h4 class="zikr-title-latin">{{ zikr.latin }}</h4>
            </div>
            
            <div class="zikr-description">
              <p>{{ getZikrDescription(zikr.identifier) }}</p>
            </div>

            <div class="zikr-controls">
              <div class="repetition-control">
                <label>{{ $t('zikr.repetitions') }}:</label>
                <div class="number-input">
                  <button @click="decreaseReps(zikr.id)" :disabled="zikr.currentReps <= 1">-</button>
                  <input 
                    type="number" 
                    v-model="zikr.currentReps" 
                    min="1" 
                    max="1000"
                    @change="updateReps(zikr.id, $event.target.value)"
                  />
                  <button @click="increaseReps(zikr.id)">+</button>
                </div>
              </div>
              
              <button 
                @click="startZikr(zikr)" 
                class="start-btn"
                :class="{ completed: isZikrCompletedToday(zikr.id) }"
              >
                {{ isZikrCompletedToday(zikr.id) ? $t('zikr.completed') : $t('zikr.start') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { zikrData } from '../data/zikrs'
import { zikrDescriptions } from '../data/zikrDescriptions'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'ZikrApp',
  setup() {
    const { isAuthenticated, user, logout, isAdmin: checkIsAdmin } = useAuth()
    const router = useRouter()
    
    const isAdmin = computed(() => {
      return checkIsAdmin()
    })

    const handleLogout = async () => {
      await logout()
      // Redirect to landing page after logout
      router.push('/')
    }

    return {
      isAuthenticated,
      user,
      isAdmin,
      handleLogout
    }
  },
  data() {
    return {
      currentLanguage: 'en',
      zikrs: [],
      todayCompletedCount: 0,
      todayTotalCount: 0,
      descriptions: {}
    }
  },
  mounted() {
    this.initializeApp()
  },
  methods: {
    async initializeApp() {
      // Load language and descriptions
      this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en'
      this.descriptions = zikrDescriptions[this.currentLanguage] || zikrDescriptions.en
      
      // Initialize zikrs with default repetitions
      this.zikrs = zikrData.map(zikr => ({
        ...zikr,
        currentReps: zikr.defaultRepetitions
      }))
      
      // Load saved repetitions preferences
      const savedReps = JSON.parse(localStorage.getItem('zikrRepetitions') || '{}')
      this.zikrs.forEach(zikr => {
        if (savedReps[zikr.id]) {
          zikr.currentReps = savedReps[zikr.id]
        }
      })
      
      this.updateTodayStats()
    },
    
    updateTodayStats() {
      const today = new Date().toDateString()
      const todayProgress = JSON.parse(localStorage.getItem('todayZikrProgress') || '{}')
      
      this.todayCompletedCount = Object.keys(todayProgress).filter(zikrId => 
        todayProgress[zikrId].date === today && todayProgress[zikrId].completed
      ).length
      
      this.todayTotalCount = this.zikrs.length
    },
    
    isZikrCompletedToday(zikrId) {
      const today = new Date().toDateString()
      const todayProgress = JSON.parse(localStorage.getItem('todayZikrProgress') || '{}')
      return todayProgress[zikrId]?.date === today && todayProgress[zikrId]?.completed
    },
    
    getZikrDescription(identifier) {
      return this.descriptions[identifier] || ''
    },
    
    changeLanguage() {
      localStorage.setItem('selectedLanguage', this.currentLanguage)
      this.$i18n.locale = this.currentLanguage
      this.descriptions = zikrDescriptions[this.currentLanguage] || zikrDescriptions.en
    },
    
    increaseReps(zikrId) {
      const zikr = this.zikrs.find(z => z.id === zikrId)
      if (zikr && zikr.currentReps < 1000) {
        zikr.currentReps++
        this.saveRepetitionPreference(zikrId, zikr.currentReps)
      }
    },
    
    decreaseReps(zikrId) {
      const zikr = this.zikrs.find(z => z.id === zikrId)
      if (zikr && zikr.currentReps > 1) {
        zikr.currentReps--
        this.saveRepetitionPreference(zikrId, zikr.currentReps)
      }
    },
    
    updateReps(zikrId, value) {
      const reps = Math.max(1, Math.min(1000, parseInt(value) || 1))
      const zikr = this.zikrs.find(z => z.id === zikrId)
      if (zikr) {
        zikr.currentReps = reps
        this.saveRepetitionPreference(zikrId, reps)
      }
    },
    
    saveRepetitionPreference(zikrId, reps) {
      const savedReps = JSON.parse(localStorage.getItem('zikrRepetitions') || '{}')
      savedReps[zikrId] = reps
      localStorage.setItem('zikrRepetitions', JSON.stringify(savedReps))
    },
    
    startZikr(zikr) {
      this.$router.push({
        name: 'ZikrCounter',
        params: { id: zikr.id },
        query: { repetitions: zikr.currentReps }
      })
    },
    
    showHistory() {
      this.$router.push({ name: 'ZikrHistory' })
    }
  }
}
</script>

<style scoped>
.zikr-app {
  min-height: 100vh;
  background: #f8f9fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.admin-btn:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

.history-btn,
.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.history-btn:hover,
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.language-selector select {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 12px;
  border-radius: 15px;
  cursor: pointer;
}

.app-main {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.today-progress {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.today-progress h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.progress-stats {
  display: flex;
  gap: 30px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.zikr-list h2 {
  margin-bottom: 25px;
  color: #2c3e50;
}

.zikr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.zikr-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #667eea;
}

.zikr-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.zikr-card.completed {
  border-left-color: #28a745;
  background: #f8fff9;
}

.zikr-header {
  margin-bottom: 15px;
}

.zikr-title-arabic {
  font-size: 1.4rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
  text-align: right;
  direction: rtl;
}

.zikr-title-latin {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  font-style: italic;
}

.zikr-description {
  margin-bottom: 20px;
}

.zikr-description p {
  color: #495057;
  line-height: 1.6;
  margin: 0;
}

.zikr-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 15px;
}

.repetition-control label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.number-input {
  display: flex;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.number-input button {
  background: #f8f9fa;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: #495057;
  transition: background 0.2s ease;
}

.number-input button:hover:not(:disabled) {
  background: #e9ecef;
}

.number-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-input input {
  border: none;
  padding: 8px 12px;
  width: 60px;
  text-align: center;
  font-weight: 500;
}

.start-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.start-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.start-btn.completed {
  background: #28a745;
}

.start-btn.completed:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 15px;
  }

  .zikr-grid {
    grid-template-columns: 1fr;
  }

  .zikr-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-stats {
    justify-content: center;
  }
}
</style>