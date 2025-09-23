<template>
  <div class="zikr-app">
    <header class="app-header">
      <router-link to="/" class="logo-title-link">
        <div class="logo-section">
          <div class="logo-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="logo-title">{{ $t('zikr.appName') }}</span>
        </div>
      </router-link>
      
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
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="logout-btn"
        >
          {{ $t('auth.logout') || 'Logout' }}
        </button>
        <router-link 
          v-else 
          to="/login" 
          class="login-btn"
        >
          {{ $t('auth.login') || 'Login' }}
        </router-link>
        <div class="language-selector">
          <CustomSelect
            :options="languageOptions"
            v-model="currentLanguage"
            theme="app"
            placeholder="Language"
          />
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
            v-for="zikr in paginatedZikrs" 
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
        
        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="pagination-btn prev-btn"
          >
            &#8249; {{ $t('zikr.previous') || 'Previous' }}
          </button>
          
          <div class="pagination-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="{ active: page === currentPage }"
              class="pagination-number"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="pagination-btn next-btn"
          >
            {{ $t('zikr.next') || 'Next' }} &#8250;
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { zikrData } from '../data/zikrs'
import { zikrDescriptions } from '../data/zikrDescriptions'
import { useAuth } from '@/composables/useAuth'
import { useModal } from '@/composables/useModal'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import CustomSelect from '@/components/CustomSelect.vue'

export default {
  name: 'ZikrApp',
  components: {
    CustomSelect
  },
  setup() {
    const { isAuthenticated, user, logout, isAdmin: checkIsAdmin } = useAuth()
    const { showConfirm } = useModal()
    const router = useRouter()
    
    const isAdmin = computed(() => {
      return checkIsAdmin()
    })

    const handleLogout = async () => {
      const confirmed = await showConfirm(
        'Are you sure you want to logout?',
        { 
          type: 'warning', 
          title: 'Confirm Logout',
          confirmText: 'Logout',
          cancelText: 'Cancel'
        }
      )
      
      if (confirmed) {
        await logout()
        // Redirect to landing page after logout
        router.push('/')
      }
    }

    return {
      isAuthenticated,
      user,
      isAdmin,
      handleLogout
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.zikrs.length / this.itemsPerPage)
    },
    paginatedZikrs() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.zikrs.slice(start, end)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  data() {
    return {
      currentLanguage: 'en',
      languageOptions: [
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'العربية' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'bs', label: 'Bosanski' },
        { value: 'hr', label: 'Hrvatski' },
        { value: 'sr', label: 'Српски' }
      ],
      zikrs: [],
      todayCompletedCount: 0,
      todayTotalCount: 0,
      descriptions: {},
      // Pagination
      currentPage: 1,
      itemsPerPage: 6
    }
  },
  watch: {
    currentLanguage(newLanguage) {
      console.log('ZikrApp: language changed to', newLanguage)
      localStorage.setItem('selectedLanguage', newLanguage)
      this.$i18n.locale = newLanguage
      this.descriptions = zikrDescriptions[newLanguage] || zikrDescriptions.en
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
      
      // Load zikrs from API/database
      await this.loadZikrs()
    },

    async loadZikrs() {
      try {
        const response = await fetch('/api/zikrs')
        const data = await response.json()
        if (data.success) {
          // Initialize zikrs with current repetitions
          this.zikrs = data.data.map(zikr => ({
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
          
          // Update today's stats after loading zikrs
          this.updateTodayStats()
        } else {
          console.error('Failed to load zikrs:', data.message)
          // Fallback to local data
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
          
          // Update today's stats after loading fallback data
          this.updateTodayStats()
        }
      } catch (error) {
        console.error('Error loading zikrs:', error)
        // Fallback to local data
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
        
        // Update today's stats after loading fallback data
        this.updateTodayStats()
      }
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
    },

    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
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

.logo-title-link {
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
}

.logo-title-link:hover {
  transform: translateY(-2px);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
}

.logo-title-link:hover .logo-placeholder {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(10deg);
}

.logo-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
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
.logout-btn,
.login-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.history-btn:hover,
.logout-btn:hover,
.login-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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

.start-btn.completed:hover {
  background: #218838;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  padding: 20px 0;
}

.pagination-btn {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-btn:hover:not(:disabled) {
  background: #e9ecef;
  color: #495057;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-number {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover {
  background: #e9ecef;
  color: #495057;
}

.pagination-number.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-number.active:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
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

  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 14px;
  }

  .pagination-number {
    padding: 8px 10px;
    min-width: 40px;
    font-size: 14px;
  }
}
</style>