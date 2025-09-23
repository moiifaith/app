<template>
  <div class="zikr-history">
    <header class="history-header">
      <button @click="goBack" class="back-btn">← {{ $t('zikr.back') }}</button>
      <h1>{{ $t('zikr.zikrHistory') }}</h1>
      <div class="view-controls">
        <button 
          @click="currentView = 'today'" 
          :class="{ active: currentView === 'today' }"
          class="view-btn"
        >
          {{ $t('zikr.today') }}
        </button>
        <button 
          @click="currentView = 'daily'" 
          :class="{ active: currentView === 'daily' }"
          class="view-btn"
        >
          {{ $t('zikr.daily') }}
        </button>
        <button 
          @click="currentView = 'monthly'" 
          :class="{ active: currentView === 'monthly' }"
          class="view-btn"
        >
          {{ $t('zikr.monthly') }}
        </button>
      </div>
    </header>

    <main class="history-main">
      <!-- Today View -->
      <div v-if="currentView === 'today'" class="today-view">
        <div class="stats-summary">
          <div class="stat-card">
            <span class="stat-number">{{ todayStats.completed }}</span>
            <span class="stat-label">{{ $t('zikr.completedToday') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ todayStats.total }}</span>
            <span class="stat-label">{{ $t('zikr.totalZikrs') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ todayStats.totalCount }}</span>
            <span class="stat-label">{{ $t('zikr.totalRepetitions') }}</span>
          </div>
        </div>

        <div class="today-zikrs">
          <h2>{{ $t('zikr.todayProgress') }}</h2>
          <div class="zikr-progress-list">
            <div 
              v-for="progress in todayProgress" 
              :key="progress.zikrId"
              class="progress-item"
              :class="{ completed: progress.completed }"
            >
              <div class="zikr-info">
                <h3>{{ getZikrName(progress.zikrId) }}</h3>
                <p class="progress-text">
                  {{ progress.count }} / {{ progress.targetCount }}
                  <span v-if="progress.completed" class="completed-badge">✓</span>
                </p>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${(progress.count / progress.targetCount) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily View -->
      <div v-if="currentView === 'daily'" class="daily-view">
        <div class="date-selector">
          <input 
            type="date" 
            v-model="selectedDate" 
            @change="loadDailyData"
            class="date-input"
          />
        </div>

        <div v-if="selectedDateData.length > 0" class="daily-data">
          <h2>{{ formatDate(selectedDate) }}</h2>
          <div class="daily-summary">
            <div class="summary-stat">
              <span>{{ getDailySummary(selectedDateData).completed }}</span>
              <small>{{ $t('zikr.completed') }}</small>
            </div>
            <div class="summary-stat">
              <span>{{ getDailySummary(selectedDateData).totalCount }}</span>
              <small>{{ $t('zikr.totalRepetitions') }}</small>
            </div>
          </div>

          <div class="daily-zikrs">
            <div 
              v-for="item in selectedDateData" 
              :key="item.zikrId"
              class="daily-zikr-item"
              :class="{ completed: item.completed }"
            >
              <h3>{{ getZikrName(item.zikrId) }}</h3>
              <div class="zikr-stats">
                <span class="count">{{ item.count }} / {{ item.targetCount }}</span>
                <span class="status" :class="{ completed: item.completed }">
                  {{ item.completed ? $t('zikr.completed') : $t('zikr.incomplete') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          <p>{{ $t('zikr.noDataForDate') }}</p>
        </div>
      </div>

      <!-- Monthly View -->
      <div v-if="currentView === 'monthly'" class="monthly-view">
        <div class="month-selector">
          <input 
            type="month" 
            v-model="selectedMonth" 
            @change="loadMonthlyData"
            class="month-input"
          />
        </div>

        <div v-if="monthlyData.length > 0" class="monthly-data">
          <h2>{{ formatMonth(selectedMonth) }}</h2>
          
          <div class="monthly-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.activeDays }}</span>
                <span class="summary-label">{{ $t('zikr.activeDays') }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.totalCompleted }}</span>
                <span class="summary-label">{{ $t('zikr.totalCompleted') }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.totalRepetitions }}</span>
                <span class="summary-label">{{ $t('zikr.totalRepetitions') }}</span>
              </div>
            </div>
          </div>

          <div class="monthly-calendar">
            <h3>{{ $t('zikr.dailyProgress') }}</h3>
            <div class="calendar-grid">
              <div 
                v-for="day in monthlyCalendar" 
                :key="day.date"
                class="calendar-day"
                :class="{ 
                  active: day.hasData, 
                  today: day.isToday,
                  'good-progress': day.completionRate >= 0.7,
                  'some-progress': day.completionRate > 0 && day.completionRate < 0.7
                }"
                @click="viewDayDetails(day.isoDate)"
              >
                <span class="day-number">{{ day.dayNumber }}</span>
                <div v-if="day.hasData" class="day-progress">
                  {{ day.completed }} / {{ day.total }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          <p>{{ $t('zikr.noDataForMonth') }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { zikrData } from '../data/zikrs'

export default {
  name: 'ZikrHistory',
  data() {
    return {
      currentView: 'today',
      selectedDate: new Date().toISOString().split('T')[0],
      selectedMonth: new Date().toISOString().slice(0, 7),
      todayProgress: [],
      todayStats: { completed: 0, total: 0, totalCount: 0 },
      selectedDateData: [],
      monthlyData: [],
      monthlyStats: { activeDays: 0, totalCompleted: 0, totalRepetitions: 0 },
      monthlyCalendar: [],
      zikrs: [] // Store loaded zikrs for name lookups
    }
  },
  mounted() {
    this.loadZikrsAndInitialize()
  },
  methods: {
    async loadZikrsAndInitialize() {
      try {
        // Load zikrs from API first
        const response = await fetch('/api/zikrs')
        const data = await response.json()
        
        if (data.success) {
          this.zikrs = data.data
        } else {
          // Fallback to local data
          this.zikrs = zikrData
        }
      } catch (error) {
        console.error('Error loading zikrs:', error)
        // Fallback to local data
        this.zikrs = zikrData
      }
      
      // Now load the history data
      this.loadTodayData()
      this.loadDailyData()
      this.loadMonthlyData()
    },

    goBack() {
      this.$router.push('/zikrs')
    },

    loadTodayData() {
      const today = new Date().toDateString()
      const todayProgress = JSON.parse(localStorage.getItem('todayZikrProgress') || '{}')
      
      this.todayProgress = Object.entries(todayProgress)
        .filter(([, data]) => data.date === today)
        .map(([zikrId, data]) => ({
          zikrId: parseInt(zikrId),
          ...data
        }))

      this.todayStats = {
        completed: this.todayProgress.filter(p => p.completed).length,
        total: this.todayProgress.length,
        totalCount: this.todayProgress.reduce((sum, p) => sum + p.count, 0)
      }
    },

    loadDailyData() {
      const selectedDateString = new Date(this.selectedDate).toDateString()
      const allProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      
      this.selectedDateData = Object.values(allProgress)
        .filter(progress => progress.date === selectedDateString)
        .map(progress => ({
          zikrId: progress.zikrId,
          count: progress.count,
          targetCount: progress.targetCount,
          completed: progress.completed
        }))
    },

    loadMonthlyData() {
      const [year, month] = this.selectedMonth.split('-')
      const allProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      
      this.monthlyData = Object.values(allProgress).filter(progress => {
        const progressDate = new Date(progress.date)
        return progressDate.getFullYear() === parseInt(year) && 
               progressDate.getMonth() === parseInt(month) - 1
      })

      this.calculateMonthlyStats()
      this.generateMonthlyCalendar()
    },

    calculateMonthlyStats() {
      const dailyData = {}
      
      this.monthlyData.forEach(progress => {
        if (!dailyData[progress.date]) {
          dailyData[progress.date] = { completed: 0, total: 0, repetitions: 0 }
        }
        dailyData[progress.date].total++
        dailyData[progress.date].repetitions += progress.count
        if (progress.completed) {
          dailyData[progress.date].completed++
        }
      })

      this.monthlyStats = {
        activeDays: Object.keys(dailyData).length,
        totalCompleted: Object.values(dailyData).reduce((sum, day) => sum + day.completed, 0),
        totalRepetitions: Object.values(dailyData).reduce((sum, day) => sum + day.repetitions, 0)
      }
    },

    generateMonthlyCalendar() {
      const [year, month] = this.selectedMonth.split('-')
      const lastDay = new Date(year, month, 0)
      const today = new Date()
      
      this.monthlyCalendar = []

      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month - 1, day)
        const dateString = currentDate.toDateString()
        // Store both date string and ISO date for reliable conversion
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        
        const dayData = this.monthlyData.filter(p => p.date === dateString)
        const completed = dayData.filter(p => p.completed).length
        const total = dayData.length
        
        this.monthlyCalendar.push({
          date: dateString,
          isoDate: isoDate, // Add ISO date for reliable conversion
          dayNumber: day,
          hasData: dayData.length > 0,
          completed,
          total,
          completionRate: total > 0 ? completed / total : 0,
          isToday: currentDate.toDateString() === today.toDateString()
        })
      }
    },

    getDailySummary(data) {
      return {
        completed: data.filter(item => item.completed).length,
        totalCount: data.reduce((sum, item) => sum + item.count, 0)
      }
    },

    getZikrName(zikrId) {
      // Ensure zikrId is a number for comparison
      const numericZikrId = parseInt(zikrId)
      
      // First try to find in loaded zikrs
      let zikr = this.zikrs.find(z => z.id === numericZikrId)
      
      // If not found and zikrs array is empty, fallback to static data
      if (!zikr && this.zikrs.length === 0) {
        zikr = zikrData.find(z => z.id === numericZikrId)
      }
      
      return zikr ? zikr.latin : `Unknown Zikr (ID: ${zikrId})`
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString(this.$i18n.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatMonth(monthString) {
      const [year, month] = monthString.split('-')
      return new Date(year, month - 1).toLocaleDateString(this.$i18n.locale, {
        year: 'numeric',
        month: 'long'
      })
    },

    viewDayDetails(date) {
      // Use the ISO date directly to avoid timezone conversion issues
      this.selectedDate = date
      this.currentView = 'daily'
      this.loadDailyData()
    }
  }
}
</script>

<style scoped>
.zikr-history {
  min-height: 100vh;
  background: #f8f9fa;
}

.history-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.history-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn:hover, .view-btn.active {
  background: rgba(255, 255, 255, 0.3);
}

.history-main {
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Today View */
.stats-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.today-zikrs h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.zikr-progress-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #dee2e6;
  transition: all 0.3s ease;
}

.progress-item.completed {
  border-left-color: #28a745;
  background: #f8fff9;
}

.zikr-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.zikr-info h3 {
  margin: 0;
  color: #2c3e50;
}

.progress-text {
  margin: 0;
  color: #6c757d;
  font-weight: 500;
}

.completed-badge {
  color: #28a745;
  font-weight: bold;
  margin-left: 10px;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #667eea;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-item.completed .progress-fill {
  background: #28a745;
}

/* Daily View */
.date-selector, .month-selector {
  margin-bottom: 30px;
  text-align: center;
}

.date-input, .month-input {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.daily-data h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.daily-summary {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.summary-stat {
  text-align: center;
}

.summary-stat span {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.summary-stat small {
  color: #6c757d;
}

.daily-zikrs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.daily-zikr-item {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #dee2e6;
}

.daily-zikr-item.completed {
  border-left-color: #28a745;
  background: #f8fff9;
}

.daily-zikr-item h3 {
  margin: 0;
  color: #2c3e50;
}

.zikr-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.count {
  font-weight: bold;
  color: #495057;
}

.status {
  font-size: 0.9rem;
  color: #6c757d;
}

.status.completed {
  color: #28a745;
}

/* Monthly View */
.monthly-summary {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.summary-item {
  text-align: center;
}

.summary-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.summary-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.monthly-calendar {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.monthly-calendar h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  color: #6c757d;
  padding: 5px;
}

.calendar-day.active {
  background: #e3f2fd;
  color: #1976d2;
}

.calendar-day.good-progress {
  background: #e8f5e8;
  color: #2e7d32;
}

.calendar-day.some-progress {
  background: #fff3e0;
  color: #f57c00;
}

.calendar-day.today {
  border: 2px solid #667eea;
}

.calendar-day:hover {
  transform: scale(1.05);
}

.day-number {
  font-weight: 600;
  margin-bottom: 2px;
}

.day-progress {
  font-size: 0.7rem;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-summary {
    flex-direction: column;
    align-items: center;
  }

  .daily-summary {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .daily-zikr-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .zikr-stats {
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
  }

  .calendar-day {
    padding: 3px;
  }

  .day-progress {
    font-size: 0.6rem;
  }
}
</style>