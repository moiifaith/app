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
      
      <button class="hamburger-btn" @click="mobileMenuOpen = !mobileMenuOpen" :class="{ open: mobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="header-actions" :class="{ 'menu-open': mobileMenuOpen }">
        <button @click="toggleTheme" class="theme-toggle-btn" :title="isDark ? $t('zikr.lightMode') : $t('zikr.darkMode')">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <router-link 
          v-if="isAdmin" 
          to="/admin" 
          class="admin-btn"
        >
          {{ $t('admin.panel') }}
        </router-link>
        <button @click="showHistory" class="history-btn">
          {{ $t('zikr.history') }}
        </button>
        <button 
          v-if="isAuthenticated" 
          @click="handleLogout" 
          class="logout-btn"
        >
          {{ $t('auth.logout') }}
        </button>
        <router-link 
          v-else 
          to="/login" 
          class="login-btn"
        >
          {{ $t('auth.login.button') }}
        </router-link>
        <div class="language-selector">
          <CustomSelect
            :options="languageOptions"
            v-model="currentLanguage"
            theme="app"
            :placeholder="$t('language.current')"
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

      <!-- Zikr Sequences -->
      <section v-if="sequences.length > 0 || isAuthenticated" class="sequences-section">
        <div class="sequences-header">
          <h2>{{ $t('zikr.mySequences') }}</h2>
          <button v-if="isAuthenticated" @click="showSequenceModal = true" class="add-custom-btn">
            + {{ $t('zikr.newSequence') }}
          </button>
        </div>
        <div v-if="sequences.length === 0" class="empty-sequences">
          <p>{{ $t('zikr.noSequences') }}</p>
        </div>
        <div v-else class="sequence-cards">
          <div v-for="(seq, idx) in sequences" :key="idx" class="sequence-card">
            <div class="sequence-info">
              <h3>{{ seq.name }}</h3>
              <p>{{ seq.zikrs.length }} {{ $t('zikr.zikrs') }} &middot; {{ getTotalSeqReps(seq) }} {{ $t('zikr.totalReps') }}</p>
            </div>
            <div class="sequence-actions">
              <button @click="startSequence(seq)" class="start-seq-btn">{{ $t('zikr.start') }}</button>
              <button @click="deleteSequence(idx)" class="delete-seq-btn">&times;</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Zikr List -->
      <section class="zikr-list">
        <div class="zikr-list-header">
          <h2>{{ $t('zikr.availableZikrs') }}</h2>
          <button v-if="isAuthenticated" @click="showCustomZikrModal = true" class="add-custom-btn">
            + {{ $t('zikr.addCustomZikr') }}
          </button>
        </div>

        <!-- Search & Filter -->
        <div class="zikr-search-filter">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="$t('zikr.searchPlaceholder')"
              class="search-input"
              @input="currentPage = 1"
            />
            <button v-if="searchQuery" @click="searchQuery = ''; currentPage = 1" class="search-clear">&times;</button>
          </div>
          <div class="category-filter">
            <button
              @click="selectedCategory = ''; currentPage = 1"
              class="category-btn"
              :class="{ active: selectedCategory === '' }"
            >
              {{ $t('zikr.allCategories') }}
            </button>
            <button
              v-for="(cat, key) in zikrCategories"
              :key="key"
              @click="selectedCategory = key; currentPage = 1"
              class="category-btn"
              :class="{ active: selectedCategory === key }"
            >
              {{ cat[currentLanguage] || cat.en }}
            </button>
          </div>
          <div class="filter-info">
            <span>{{ filteredZikrs.length }} {{ $t('zikr.zikrs') }}</span>
          </div>
        </div>

        <div class="zikr-grid">
          <div 
            v-for="zikr in paginatedZikrs" 
            :key="zikr.id"
            class="zikr-card"
            :class="{ completed: isZikrCompletedToday(zikr.id), custom: zikr.isCustom }"
          >
            <div class="zikr-header">
              <h3 class="zikr-title-arabic">{{ zikr.arabic }}</h3>
              <h4 class="zikr-title-latin">{{ zikr.latin }}</h4>
              <span v-if="zikr.isCustom" class="custom-badge">{{ $t('zikr.custom') }}</span>
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
            &#8249; {{ $t('zikr.previous') }}
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
            {{ $t('zikr.next') }} &#8250;
          </button>
        </div>
      </section>
    </main>

    <!-- Custom Zikr Modal -->
    <div v-if="showCustomZikrModal" class="modal-overlay" @click="showCustomZikrModal = false">
      <div class="custom-zikr-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('zikr.addCustomZikr') }}</h3>
          <button @click="showCustomZikrModal = false" class="close-modal-btn">&times;</button>
        </div>
        <form @submit.prevent="saveCustomZikr" class="custom-zikr-form">
          <div class="form-group">
            <label>{{ $t('zikr.arabicText') }}</label>
            <input type="text" v-model="customZikrForm.arabic" required dir="rtl" />
          </div>
          <div class="form-group">
            <label>{{ $t('zikr.latinText') }}</label>
            <input type="text" v-model="customZikrForm.latin" required />
          </div>
          <div class="form-group">
            <label>{{ $t('zikr.repetitions') }}</label>
            <input type="number" v-model.number="customZikrForm.defaultRepetitions" min="1" max="1000" />
          </div>
          <div class="form-actions">
            <button type="submit" class="save-custom-btn" :disabled="savingCustomZikr">
              {{ savingCustomZikr ? '...' : $t('zikr.save') }}
            </button>
            <button type="button" @click="showCustomZikrModal = false" class="cancel-btn">
              {{ $t('zikr.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sequence Modal -->
    <div v-if="showSequenceModal" class="modal-overlay" @click="showSequenceModal = false">
      <div class="custom-zikr-modal sequence-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('zikr.createSequence') }}</h3>
          <button @click="showSequenceModal = false" class="close-modal-btn">&times;</button>
        </div>
        <div class="custom-zikr-form">
          <div class="form-group">
            <label>{{ $t('zikr.sequenceName') }}</label>
            <input type="text" v-model="sequenceForm.name" :placeholder="$t('zikr.sequencePlaceholder')" required />
          </div>
          <div class="form-group">
            <label>{{ $t('zikr.selectZikrs') }}</label>
            <div class="zikr-picker">
              <div 
                v-for="zikr in zikrs" 
                :key="'pick-' + zikr.id" 
                class="zikr-pick-item"
                :class="{ selected: isInSequence(zikr.id) }"
                @click="toggleSequenceZikr(zikr)"
              >
                <span class="pick-check">{{ isInSequence(zikr.id) ? '✓' : '' }}</span>
                <span class="pick-name">{{ zikr.latin }}</span>
                <span class="pick-arabic">{{ zikr.arabic }}</span>
              </div>
            </div>
          </div>
          <div v-if="sequenceForm.zikrs.length > 0" class="selected-sequence-zikrs">
            <label>{{ $t('zikr.sequenceOrder') }} ({{ sequenceForm.zikrs.length }})</label>
            <div v-for="(sz, i) in sequenceForm.zikrs" :key="'seq-' + i" class="seq-item">
              <span>{{ i + 1 }}. {{ sz.latin }} ({{ sz.reps }}x)</span>
              <input type="number" v-model.number="sz.reps" min="1" max="1000" class="seq-reps-input" />
            </div>
          </div>
          <div class="form-actions">
            <button 
              @click="saveSequence" 
              class="save-custom-btn"
              :disabled="!sequenceForm.name || sequenceForm.zikrs.length === 0"
            >
              {{ $t('zikr.save') }}
            </button>
            <button @click="showSequenceModal = false" class="cancel-btn">
              {{ $t('zikr.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { zikrData, zikrCategories } from '../data/zikrs'
import { zikrDescriptions } from '../data/zikrDescriptions'
import { useAuth } from '@/composables/useAuth'
import { useModal } from '@/composables/useModal'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import CustomSelect from '@/components/CustomSelect.vue'
import { setLanguage, getCurrentLanguage } from '@/i18n'

export default {
  name: 'ZikrApp',
  components: {
    CustomSelect
  },
  setup() {
    const { isAuthenticated, user, logout, isAdmin: checkIsAdmin, getAuthHeaders } = useAuth()
    const { showConfirm } = useModal()
    const router = useRouter()
    const { t } = useI18n()
    const { isDark, toggleTheme } = useTheme()
    
    const isAdmin = computed(() => {
      return checkIsAdmin()
    })

    const handleLogout = async () => {
      const confirmed = await showConfirm(
        t('zikr.confirmLogout'),
        { 
          type: 'warning', 
          title: t('zikr.confirmLogoutTitle'),
          confirmText: t('auth.logout'),
          cancelText: t('zikr.cancel')
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
      handleLogout,
      getAuthHeaders,
      isDark,
      toggleTheme
    }
  },
  computed: {
    filteredZikrs() {
      let result = this.zikrs
      if (this.selectedCategory) {
        result = result.filter(z => z.category === this.selectedCategory)
      }
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.trim().toLowerCase()
        result = result.filter(z => {
          const desc = this.getZikrDescription(z.identifier) || ''
          return z.arabic.includes(q) ||
            z.latin.toLowerCase().includes(q) ||
            z.identifier.toLowerCase().includes(q) ||
            desc.toLowerCase().includes(q)
        })
      }
      return result
    },
    totalPages() {
      return Math.ceil(this.filteredZikrs.length / this.itemsPerPage)
    },
    paginatedZikrs() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredZikrs.slice(start, end)
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
      mobileMenuOpen: false,
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
      // Search & Filter
      searchQuery: '',
      selectedCategory: '',
      zikrCategories: zikrCategories,
      // Pagination
      currentPage: 1,
      itemsPerPage: 12,
      // Custom Zikr
      showCustomZikrModal: false,
      savingCustomZikr: false,
      customZikrForm: {
        arabic: '',
        latin: '',
        defaultRepetitions: 33
      },
      // Sequences
      sequences: [],
      showSequenceModal: false,
      sequenceForm: {
        name: '',
        zikrs: []
      }
    }
  },
  watch: {
    async currentLanguage(newLanguage) {
      await setLanguage(newLanguage)
      this.descriptions = zikrDescriptions[newLanguage] || zikrDescriptions.en
    }
  },
  mounted() {
    this.initializeApp()
  },
  methods: {
    async initializeApp() {
      // Load language and descriptions
      this.currentLanguage = getCurrentLanguage() || 'en'
      this.descriptions = zikrDescriptions[this.currentLanguage] || zikrDescriptions.en
      
      // Load zikrs from API/database
      await this.loadZikrs()
      
      // Load saved sequences
      this.loadSequences()
    },

    async loadZikrs() {
      // Always use local zikrData as the base (200 entries)
      this.zikrs = zikrData.map(zikr => ({
        ...zikr,
        currentReps: zikr.defaultRepetitions
      }))

      // Try to fetch custom user zikrs from API and merge them in
      try {
        const response = await fetch('/api/zikrs')
        const data = await response.json()
        if (data.success && data.data) {
          const customZikrs = data.data.filter(z => z.isCustom)
          if (customZikrs.length > 0) {
            const existingIds = new Set(this.zikrs.map(z => z.id))
            customZikrs.forEach(z => {
              if (!existingIds.has(z.id)) {
                this.zikrs.push({ ...z, currentReps: z.defaultRepetitions })
              }
            })
          }
        }
      } catch (error) {
        console.log('API unavailable, using local data')
      }

      // Load saved repetitions preferences
      const savedReps = JSON.parse(localStorage.getItem('zikrRepetitions') || '{}')
      this.zikrs.forEach(zikr => {
        if (savedReps[zikr.id]) {
          zikr.currentReps = savedReps[zikr.id]
        }
      })

      // Update today's stats after loading zikrs
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
      if (!identifier) return ''
      return this.descriptions[identifier] || zikrDescriptions.en[identifier] || ''
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
    },

    // --- Sequence Methods ---
    loadSequences() {
      try {
        this.sequences = JSON.parse(localStorage.getItem('zikrSequences') || '[]')
      } catch { this.sequences = [] }
    },

    saveSequencesToStorage() {
      localStorage.setItem('zikrSequences', JSON.stringify(this.sequences))
    },

    isInSequence(zikrId) {
      return this.sequenceForm.zikrs.some(z => z.id === zikrId)
    },

    toggleSequenceZikr(zikr) {
      const idx = this.sequenceForm.zikrs.findIndex(z => z.id === zikr.id)
      if (idx >= 0) {
        this.sequenceForm.zikrs.splice(idx, 1)
      } else {
        this.sequenceForm.zikrs.push({
          id: zikr.id,
          arabic: zikr.arabic,
          latin: zikr.latin,
          reps: zikr.currentReps || zikr.defaultRepetitions
        })
      }
    },

    getTotalSeqReps(seq) {
      return seq.zikrs.reduce((sum, z) => sum + (z.reps || 0), 0)
    },

    saveSequence() {
      if (!this.sequenceForm.name || this.sequenceForm.zikrs.length === 0) return
      this.sequences.push({
        name: this.sequenceForm.name,
        zikrs: [...this.sequenceForm.zikrs]
      })
      this.saveSequencesToStorage()
      this.showSequenceModal = false
      this.sequenceForm = { name: '', zikrs: [] }
    },

    deleteSequence(idx) {
      this.sequences.splice(idx, 1)
      this.saveSequencesToStorage()
    },

    startSequence(seq) {
      // Start the first zikr in the sequence, pass the full sequence
      if (seq.zikrs.length > 0) {
        const first = seq.zikrs[0]
        // Store the sequence in sessionStorage so ZikrCounter can use it
        sessionStorage.setItem('activeSequence', JSON.stringify({
          name: seq.name,
          zikrs: seq.zikrs,
          currentIndex: 0
        }))
        this.$router.push({
          name: 'ZikrCounter',
          params: { id: first.id },
          query: { repetitions: first.reps, sequence: '1' }
        })
      }
    },

    async saveCustomZikr() {
      if (!this.customZikrForm.arabic || !this.customZikrForm.latin) return
      
      this.savingCustomZikr = true
      try {
        const identifier = 'custom_' + this.customZikrForm.latin.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        const response = await fetch('/api/zikrs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({
            arabic: this.customZikrForm.arabic,
            latin: this.customZikrForm.latin,
            identifier,
            defaultRepetitions: this.customZikrForm.defaultRepetitions || 33,
            isCustom: true
          })
        })
        const data = await response.json()
        if (data.success) {
          this.showCustomZikrModal = false
          this.customZikrForm = { arabic: '', latin: '', defaultRepetitions: 33 }
          await this.loadZikrs()
        } else {
          alert(data.message || this.$t('zikr.saveFailed'))
        }
      } catch (error) {
        console.error('Error saving custom zikr:', error)
        alert(this.$t('zikr.saveFailed'))
      } finally {
        this.savingCustomZikr = false
      }
    }
  }
}
</script>

<style scoped>
.zikr-app {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
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

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  line-height: 1;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
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
  background: var(--bg-card);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px var(--shadow);
}

.today-progress h2 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
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
  color: #16a34a;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.zikr-list h2 {
  margin-bottom: 25px;
  color: var(--text-primary);
}

/* Search & Filter */
.zikr-search-filter {
  margin-bottom: 20px;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-secondary, #888);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #16a34a;
}

.search-input::placeholder {
  color: var(--text-secondary, #888);
}

.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--text-secondary, #888);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.search-clear:hover {
  color: var(--text-primary);
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.category-btn {
  padding: 6px 14px;
  border: 1.5px solid var(--border-color, #e0e0e0);
  border-radius: 20px;
  background: var(--bg-card);
  color: var(--text-secondary, #666);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-btn:hover {
  border-color: #16a34a;
  color: #16a34a;
}

.category-btn.active {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}

.filter-info {
  font-size: 0.85rem;
  color: var(--text-secondary, #888);
}

.zikr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.zikr-card {
  background: var(--bg-card);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 2px 10px var(--shadow);
  transition: all 0.3s ease;
  border-left: 4px solid #16a34a;
}

.zikr-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.zikr-card.completed {
  border-left-color: #28a745;
  background: var(--bg-completed, #f8fff9);
}

.zikr-header {
  margin-bottom: 15px;
}

.zikr-title-arabic {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  text-align: right;
  direction: rtl;
}

.zikr-title-latin {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

.zikr-description {
  margin-bottom: 20px;
}

.zikr-description p {
  color: var(--text-secondary);
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
  color: var(--text-secondary);
  font-weight: 500;
}

.number-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.number-input button {
  background: var(--bg-secondary);
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-secondary);
  transition: background 0.2s ease;
}

.number-input button:hover:not(:disabled) {
  background: var(--bg-secondary);
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
  background: #16a34a;
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
  background: #15803d;
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
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
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
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-card);
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.pagination-number {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
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
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.pagination-number.active {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}

.pagination-number.active:hover {
  background: #15803d;
  border-color: #15803d;
}

/* Sequences */
.sequences-section {
  margin-bottom: 20px;
}

.sequences-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sequences-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.empty-sequences p {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.sequence-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sequence-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px var(--shadow);
  border-left: 3px solid #16a34a;
}

.sequence-info h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 1.05rem;
}

.sequence-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.sequence-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.start-seq-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.start-seq-btn:hover {
  background: #15803d;
}

.delete-seq-btn {
  background: none;
  border: 1px solid #ddd;
  color: #999;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-seq-btn:hover {
  background: #fee;
  color: #c33;
  border-color: #fcc;
}

/* Sequence Modal extras */
.zikr-picker {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.zikr-pick-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}

.zikr-pick-item:hover {
  background: var(--bg-secondary);
}

.zikr-pick-item.selected {
  background: var(--accent-light);
}

.pick-check {
  width: 20px;
  color: #16a34a;
  font-weight: bold;
}

.pick-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.pick-arabic {
  font-size: 0.85rem;
  color: var(--text-secondary);
  direction: rtl;
}

.selected-sequence-zikrs {
  margin-top: 10px;
}

.selected-sequence-zikrs label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.seq-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.9rem;
  color: #555;
}

.seq-reps-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

/* Hamburger button - hidden on desktop */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  z-index: 10;
}

.hamburger-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: white;
  margin: 5px 0;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-btn.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 768px) {
  .hamburger-btn {
    display: block;
  }

  .app-header {
    flex-wrap: wrap;
    gap: 0;
    position: relative;
  }

  .header-actions {
    display: none;
    flex-direction: column;
    width: 100%;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    margin-top: 15px;
  }

  .header-actions.menu-open {
    display: flex;
  }

  .header-actions .admin-btn,
  .header-actions .history-btn,
  .header-actions .logout-btn,
  .header-actions .login-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 10px 16px;
  }

  .header-actions .language-selector {
    width: 100%;
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

/* Custom Zikr */
.zikr-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.zikr-list-header h2 {
  margin: 0;
}

.add-custom-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.add-custom-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.custom-badge {
  display: inline-block;
  background: #16a34a;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 4px;
}

.zikr-card.custom {
  border-left: 3px solid #16a34a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.custom-zikr-modal {
  background: var(--bg-card);
  border-radius: 15px;
  max-width: 450px;
  width: 100%;
  overflow: hidden;
}

.custom-zikr-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e1e5e9;
}

.custom-zikr-modal .modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal-btn:hover {
  background: #f5f5f5;
}

.custom-zikr-form {
  padding: 25px;
}

.custom-zikr-form .form-group {
  margin-bottom: 18px;
}

.custom-zikr-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-primary);
}

.custom-zikr-form input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  background: var(--input-bg);
  color: var(--text-primary);
}

.custom-zikr-form input:focus {
  outline: none;
  border-color: #16a34a;
}

.form-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
}

.save-custom-btn {
  flex: 1;
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.save-custom-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #eee;
}
</style>