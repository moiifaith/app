<template>
  <div class="admin-panel">
    <header class="admin-header">
      <div class="header-left">
        <h1>{{ $t('admin.adminPanel') || 'Admin Panel' }}</h1>
        <router-link to="/zikr-app" class="back-to-app-btn">
          ← {{ $t('admin.backToApp') || 'Back to App' }}
        </router-link>
      </div>
      <div class="header-actions">
        <span class="welcome-text">{{ $t('admin.welcome') || 'Welcome' }}, {{ user?.firstName || user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">{{ $t('admin.logout') || 'Logout' }}</button>
      </div>
    </header>

    <nav class="admin-nav">
      <button 
        @click="currentSection = 'zikrs'" 
        :class="{ active: currentSection === 'zikrs' }"
        class="nav-btn"
      >
        {{ $t('admin.manageZikrs') }}
      </button>
      <button 
        @click="currentSection = 'translations'" 
        :class="{ active: currentSection === 'translations' }"
        class="nav-btn"
      >
        {{ $t('admin.manageTranslations') }}
      </button>
      <button 
        @click="currentSection = 'users'" 
        :class="{ active: currentSection === 'users' }"
        class="nav-btn"
      >
        {{ $t('admin.manageUsers') }}
      </button>
      <button 
        @click="currentSection = 'analytics'" 
        :class="{ active: currentSection === 'analytics' }"
        class="nav-btn"
      >
        {{ $t('admin.analytics') }}
      </button>
    </nav>

    <main class="admin-main">
      <!-- Zikrs Management -->
      <div v-if="currentSection === 'zikrs'" class="section">
        <div class="section-header">
          <h2>{{ $t('admin.manageZikrs') }}</h2>
          <button @click="showAddZikrModal = true" class="primary-btn">
            {{ $t('admin.addNewZikr') }}
          </button>
        </div>

        <div class="zikrs-list">
          <div 
            v-for="zikr in zikrs" 
            :key="zikr.id"
            class="zikr-item"
          >
            <div class="zikr-content">
              <h3>{{ zikr.arabic }}</h3>
              <p class="zikr-latin">{{ zikr.latin }}</p>
              <p class="zikr-meta">
                {{ $t('admin.identifier') }}: {{ zikr.identifier }} | 
                {{ $t('admin.defaultReps') }}: {{ zikr.defaultRepetitions }}
              </p>
            </div>
            <div class="zikr-actions">
              <button @click="editZikr(zikr)" class="edit-btn">{{ $t('admin.edit') }}</button>
              <button @click="deleteZikr(zikr.id)" class="delete-btn">{{ $t('admin.delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Translations Management -->
      <div v-if="currentSection === 'translations'" class="section">
        <div class="section-header">
          <h2>{{ $t('admin.manageTranslations') }}</h2>
          <div class="language-selector">
            <select v-model="selectedLanguage" @change="loadTranslations">
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

        <div class="translations-editor">
          <div class="translation-group">
            <h3>{{ $t('admin.zikrDescriptions') }}</h3>
            <div class="translation-items">
              <div 
                v-for="(description, key) in currentTranslations" 
                :key="key"
                class="translation-item"
              >
                <label>{{ key }}</label>
                <textarea 
                  v-model="currentTranslations[key]"
                  @input="markTranslationsDirty"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div class="translation-actions">
            <button @click="saveTranslations" :disabled="!translationsDirty" class="primary-btn">
              {{ $t('admin.saveChanges') }}
            </button>
            <button @click="loadTranslations" class="secondary-btn">
              {{ $t('admin.resetChanges') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Users Management -->
      <div v-if="currentSection === 'users'" class="section">
        <div class="section-header">
          <h2>{{ $t('admin.userAnalytics') }}</h2>
        </div>

        <div class="users-stats">
          <div class="stat-card">
            <h3>{{ $t('admin.totalUsers') }}</h3>
            <p class="stat-number">{{ userStats.totalUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ $t('admin.activeUsers') }}</h3>
            <p class="stat-number">{{ userStats.activeUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>{{ $t('admin.totalSessions') }}</h3>
            <p class="stat-number">{{ userStats.totalSessions }}</p>
          </div>
        </div>

        <div class="users-table">
          <h3>{{ $t('admin.recentActivity') }}</h3>
          <table>
            <thead>
              <tr>
                <th>{{ $t('admin.date') }}</th>
                <th>{{ $t('admin.zikr') }}</th>
                <th>{{ $t('admin.completions') }}</th>
                <th>{{ $t('admin.totalCount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in recentActivity" :key="activity.id">
                <td>{{ formatDate(activity.date) }}</td>
                <td>{{ getZikrName(activity.zikrId) }}</td>
                <td>{{ activity.completions }}</td>
                <td>{{ activity.totalCount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Analytics -->
      <div v-if="currentSection === 'analytics'" class="section">
        <div class="section-header">
          <h2>{{ $t('admin.analytics') }}</h2>
        </div>

        <div class="analytics-grid">
          <div class="analytics-card">
            <h3>{{ $t('admin.mostPopularZikrs') }}</h3>
            <div class="popular-zikrs">
              <div v-for="zikr in popularZikrs" :key="zikr.id" class="popular-item">
                <span class="zikr-name">{{ zikr.name }}</span>
                <span class="zikr-count">{{ zikr.count }}</span>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <h3>{{ $t('admin.dailyActivity') }}</h3>
            <div class="activity-chart">
              <div v-for="day in dailyActivity" :key="day.date" class="activity-bar">
                <div 
                  class="bar-fill" 
                  :style="{ height: `${(day.count / maxDailyActivity) * 100}%` }"
                ></div>
                <span class="bar-label">{{ formatShortDate(day.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add/Edit Zikr Modal -->
    <div v-if="showAddZikrModal || editingZikr" class="modal-overlay" @click="closeZikrModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingZikr ? $t('admin.editZikr') : $t('admin.addZikr') }}</h3>
          <button @click="closeZikrModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveZikr" class="modal-form">
          <div class="form-group">
            <label>{{ $t('admin.arabicText') }}</label>
            <input type="text" v-model="zikrForm.arabic" required />
          </div>
          
          <div class="form-group">
            <label>{{ $t('admin.latinText') }}</label>
            <input type="text" v-model="zikrForm.latin" required />
          </div>
          
          <div class="form-group">
            <label>{{ $t('admin.identifier') }}</label>
            <input type="text" v-model="zikrForm.identifier" required />
          </div>
          
          <div class="form-group">
            <label>{{ $t('admin.defaultRepetitions') }}</label>
            <input type="number" v-model="zikrForm.defaultRepetitions" min="1" required />
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="primary-btn">{{ $t('admin.save') }}</button>
            <button type="button" @click="closeZikrModal" class="secondary-btn">{{ $t('admin.cancel') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { zikrData } from '../data/zikrs'
import { zikrDescriptions } from '../data/zikrDescriptions'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminPanel',
  setup() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = async () => {
      await logout()
      router.push('/')
    }

    return {
      user,
      handleLogout
    }
  },
  data() {
    return {
      currentSection: 'zikrs',
      zikrs: [],
      showAddZikrModal: false,
      editingZikr: null,
      zikrForm: {
        arabic: '',
        latin: '',
        identifier: '',
        defaultRepetitions: 33
      },
      selectedLanguage: 'en',
      currentTranslations: {},
      translationsDirty: false,
      userStats: {
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0
      },
      recentActivity: [],
      popularZikrs: [],
      dailyActivity: [],
      maxDailyActivity: 1
    }
  },
  mounted() {
    this.loadZikrs()
    this.loadTranslations()
    this.loadUserStats()
    this.loadAnalytics()
  },
  methods: {
    loadZikrs() {
      // In production, this would fetch from your API
      this.zikrs = [...zikrData]
    },

    loadTranslations() {
      this.currentTranslations = { ...zikrDescriptions[this.selectedLanguage] }
      this.translationsDirty = false
    },

    markTranslationsDirty() {
      this.translationsDirty = true
    },

    saveTranslations() {
      // In production, this would save to your API
      // For now, just update the local data
      zikrDescriptions[this.selectedLanguage] = { ...this.currentTranslations }
      localStorage.setItem(`zikrDescriptions_${this.selectedLanguage}`, JSON.stringify(this.currentTranslations))
      this.translationsDirty = false
      alert(this.$t('admin.translationsSaved'))
    },

    editZikr(zikr) {
      this.editingZikr = zikr
      this.zikrForm = { ...zikr }
    },

    closeZikrModal() {
      this.showAddZikrModal = false
      this.editingZikr = null
      this.zikrForm = {
        arabic: '',
        latin: '',
        identifier: '',
        defaultRepetitions: 33
      }
    },

    saveZikr() {
      if (this.editingZikr) {
        // Update existing zikr
        const index = this.zikrs.findIndex(z => z.id === this.editingZikr.id)
        if (index !== -1) {
          this.zikrs[index] = { ...this.zikrForm, id: this.editingZikr.id }
        }
      } else {
        // Add new zikr
        const newId = Math.max(...this.zikrs.map(z => z.id)) + 1
        this.zikrs.push({ ...this.zikrForm, id: newId })
      }
      
      // In production, this would save to your API
      localStorage.setItem('adminZikrs', JSON.stringify(this.zikrs))
      this.closeZikrModal()
      alert(this.$t('admin.zikrSaved'))
    },

    deleteZikr(id) {
      if (confirm(this.$t('admin.confirmDeleteZikr'))) {
        this.zikrs = this.zikrs.filter(z => z.id !== id)
        // In production, this would delete from your API
        localStorage.setItem('adminZikrs', JSON.stringify(this.zikrs))
        alert(this.$t('admin.zikrDeleted'))
      }
    },

    loadUserStats() {
      // In production, this would fetch from your analytics API
      // For demo, generate some sample data based on localStorage
      const allProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      const sessions = JSON.parse(localStorage.getItem('zikrSessions') || '[]')
      
      const uniqueDates = new Set(Object.values(allProgress).map(p => p.date))
      
      this.userStats = {
        totalUsers: 1, // Demo value
        activeUsers: uniqueDates.size > 0 ? 1 : 0,
        totalSessions: sessions.length
      }

      // Generate recent activity
      this.recentActivity = Object.values(allProgress)
        .slice(-10)
        .map((progress, index) => ({
          id: index,
          date: progress.date,
          zikrId: progress.zikrId,
          completions: progress.completed ? 1 : 0,
          totalCount: progress.count
        }))
    },

    loadAnalytics() {
      // In production, this would fetch from your analytics API
      const allProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      
      // Calculate popular zikrs
      const zikrCounts = {}
      Object.values(allProgress).forEach(progress => {
        if (!zikrCounts[progress.zikrId]) {
          zikrCounts[progress.zikrId] = 0
        }
        zikrCounts[progress.zikrId] += progress.count
      })

      this.popularZikrs = Object.entries(zikrCounts)
        .map(([zikrId, count]) => ({
          id: zikrId,
          name: this.getZikrName(parseInt(zikrId)),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate daily activity
      const dailyData = {}
      Object.values(allProgress).forEach(progress => {
        if (!dailyData[progress.date]) {
          dailyData[progress.date] = 0
        }
        dailyData[progress.date] += progress.count
      })

      this.dailyActivity = Object.entries(dailyData)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7) // Last 7 days

      this.maxDailyActivity = Math.max(...this.dailyActivity.map(d => d.count), 1)
    },

    getZikrName(zikrId) {
      const zikr = this.zikrs.find(z => z.id === zikrId)
      return zikr ? zikr.latin : 'Unknown Zikr'
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    formatShortDate(dateString) {
      return new Date(dateString).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    }
  }
}
</script>

<style scoped>
.admin-panel {
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.back-to-app-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-to-app-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-text {
  font-weight: 500;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.admin-nav {
  background: white;
  padding: 0 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.nav-btn {
  background: transparent;
  border: none;
  padding: 15px 20px;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-btn:hover, .nav-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.admin-main {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.primary-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.primary-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.primary-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #667eea;
  color: white;
}

/* Zikrs Section */
.zikrs-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.zikr-item {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zikr-content h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.zikr-latin {
  margin: 0 0 5px 0;
  color: #6c757d;
  font-style: italic;
}

.zikr-meta {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.zikr-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover {
  background: #ffca2c;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

/* Translations Section */
.language-selector select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.translations-editor {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.translation-group h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.translation-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.translation-item label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.translation-item textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.translation-item textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.translation-actions {
  display: flex;
  gap: 15px;
}

/* Users Section */
.users-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
}

.users-table {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.users-table h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

/* Analytics Section */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.analytics-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.analytics-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.popular-zikrs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.popular-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f3f4;
}

.zikr-name {
  color: #495057;
}

.zikr-count {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.activity-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 200px;
  padding: 20px 0;
}

.activity-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-fill {
  background: #667eea;
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  margin-bottom: 8px;
}

.bar-label {
  font-size: 0.8rem;
  color: #6c757d;
  transform: rotate(-45deg);
  white-space: nowrap;
}

/* Modal */
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

.modal {
  background: white;
  border-radius: 15px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-form {
  padding: 25px;
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
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .zikr-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .zikr-actions {
    justify-content: flex-end;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .users-table {
    overflow-x: auto;
  }

  .modal {
    margin: 20px;
    max-width: none;
  }
}
</style>