<template>
  <div class="prayer-history">
    <header class="history-header">
      <button @click="goBack" class="back-btn">← {{ $t('prayer.back') }}</button>
      <h1>{{ $t('prayer.prayerHistory') }}</h1>
      <div class="view-controls">
        <button
          @click="currentView = 'today'"
          :class="{ active: currentView === 'today' }"
          class="view-btn"
        >
          {{ $t('prayer.today') }}
        </button>
        <button
          @click="currentView = 'daily'"
          :class="{ active: currentView === 'daily' }"
          class="view-btn"
        >
          {{ $t('prayer.daily') }}
        </button>
        <button
          @click="currentView = 'monthly'"
          :class="{ active: currentView === 'monthly' }"
          class="view-btn"
        >
          {{ $t('prayer.monthly') }}
        </button>
      </div>
    </header>

    <main class="history-main">

      <!-- TODAY view -->
      <div v-if="currentView === 'today'" class="today-view">
        <div class="stats-summary">
          <div class="stat-card prayed-card">
            <span class="stat-number">{{ todayStats.prayed }}</span>
            <span class="stat-label">{{ $t('prayer.prayedCount') }}</span>
          </div>
          <div class="stat-card kaza-card">
            <span class="stat-number">{{ todayStats.kaza }}</span>
            <span class="stat-label">{{ $t('prayer.kazaCount') }}</span>
          </div>
          <div class="stat-card missed-card">
            <span class="stat-number">{{ todayStats.missed }}</span>
            <span class="stat-label">{{ $t('prayer.missedCount') }}</span>
          </div>
        </div>

        <div class="prayers-table-wrap">
          <h2>{{ $t('prayer.summary') }}</h2>
          <div class="prayers-table">
            <div
              v-for="prayer in prayers"
              :key="prayer.id"
              class="prayer-row"
              :class="todayData[prayer.id] || 'pending'"
            >
              <span class="prayer-arabic-sm">{{ prayer.arabic }}</span>
              <span class="prayer-name">{{ $t('prayer.' + prayer.id) }}</span>
              <span class="prayer-status-badge" :class="todayData[prayer.id] || 'pending'">
                {{ statusLabel(todayData[prayer.id]) }}
              </span>
            </div>
          </div>
        </div>

        <div class="go-back-btn-wrap">
          <button @click="$router.push('/prayers')" class="cta-btn">
            ← {{ $t('prayer.dailyPrayers') }}
          </button>
        </div>
      </div>

      <!-- DAILY view -->
      <div v-if="currentView === 'daily'" class="daily-view">
        <div class="date-selector">
          <input
            type="date"
            v-model="selectedDate"
            @change="loadDailyData"
            class="date-input"
          />
        </div>

        <div v-if="hasSelectedDateData" class="daily-data">
          <h2>{{ formatDate(selectedDate) }}</h2>
          <div class="daily-summary">
            <div class="summary-stat prayed">
              <span>{{ selectedDateStats.prayed }}</span>
              <small>{{ $t('prayer.prayedCount') }}</small>
            </div>
            <div class="summary-stat kaza">
              <span>{{ selectedDateStats.kaza }}</span>
              <small>{{ $t('prayer.kazaCount') }}</small>
            </div>
            <div class="summary-stat missed">
              <span>{{ selectedDateStats.missed }}</span>
              <small>{{ $t('prayer.missedCount') }}</small>
            </div>
          </div>

          <div class="prayers-table">
            <div
              v-for="prayer in prayers"
              :key="prayer.id"
              class="prayer-row"
              :class="selectedDateData[prayer.id] || 'pending'"
            >
              <span class="prayer-arabic-sm">{{ prayer.arabic }}</span>
              <span class="prayer-name">{{ $t('prayer.' + prayer.id) }}</span>
              <span class="prayer-status-badge" :class="selectedDateData[prayer.id] || 'pending'">
                {{ statusLabel(selectedDateData[prayer.id]) }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          <p>{{ $t('prayer.noDataForDate') }}</p>
        </div>
      </div>

      <!-- MONTHLY view -->
      <div v-if="currentView === 'monthly'" class="monthly-view">
        <div class="month-selector">
          <input
            type="month"
            v-model="selectedMonth"
            @change="loadMonthlyData"
            class="month-input"
          />
        </div>

        <div v-if="monthlyCalendar.length > 0">
          <h2 class="month-title">{{ formatMonth(selectedMonth) }}</h2>

          <div class="monthly-summary">
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.activeDays }}</span>
                <span class="summary-label">{{ $t('prayer.activeDays') }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.totalPrayed }}</span>
                <span class="summary-label">{{ $t('prayer.prayedCount') }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-number">{{ monthlyStats.fullDays }}</span>
                <span class="summary-label">{{ $t('prayer.fullDay') }}</span>
              </div>
            </div>
          </div>

          <div class="monthly-calendar">
            <h3>{{ $t('prayer.dailyProgress') }}</h3>
            <div class="calendar-grid">
              <div
                v-for="day in monthlyCalendar"
                :key="day.isoDate"
                class="calendar-day"
                :class="{
                  active: day.hasData,
                  today: day.isToday,
                  'all-prayed': day.hasData && day.prayedCount === 5,
                  'good-progress': day.hasData && day.prayedCount >= 3 && day.prayedCount < 5,
                  'some-missed': day.hasData && day.missedCount > 0
                }"
                @click="viewDayDetails(day.isoDate)"
                :title="day.hasData ? `${day.prayedCount}/5 ${$t('prayer.prayed')}` : ''"
              >
                <span class="day-number">{{ day.dayNumber }}</span>
                <div v-if="day.hasData" class="day-icons">
                  <span v-for="p in day.miniIcons" :key="p.id" class="mini-dot" :class="p.status || 'pending'"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-data">
          <p>{{ $t('prayer.noDataForMonth') }}</p>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'

const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_ARABIC = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
}

export default {
  name: 'PrayerHistory',
  setup() {
    const { isAuthenticated, token } = useAuth()
    return { isAuthenticated, token }
  },
  data() {
    return {
      prayers: PRAYER_IDS.map(id => ({ id, arabic: PRAYER_ARABIC[id] })),
      currentView: 'today',
      selectedDate: new Date().toISOString().split('T')[0],
      selectedMonth: new Date().toISOString().slice(0, 7),
      todayStats: { prayed: 0, kaza: 0, missed: 0 },
      todayData: {},
      selectedDateData: {},
      selectedDateStats: { prayed: 0, kaza: 0, missed: 0 },
      hasSelectedDateData: false,
      monthlyCalendar: [],
      monthlyStats: { activeDays: 0, totalPrayed: 0, fullDays: 0 }
    }
  },
  mounted() {
    this.loadTodayData()
    this.loadDailyData()
    this.loadMonthlyData()
  },
  methods: {
    goBack() {
      this.$router.push('/prayers')
    },

    getAllProgress() {
      return JSON.parse(localStorage.getItem('prayerProgress') || '{}')
    },

    authHeaders() {
      return { Authorization: `Bearer ${this.token}` }
    },

    applyDayData(all, isoDate, apiRow) {
      // Merge API row into local progress map
      if (apiRow) {
        const entry = {}
        PRAYER_IDS.forEach(id => { entry[id] = apiRow[id] || null })
        all[isoDate] = entry
      }
    },

    async loadTodayData() {
      const todayKey = new Date().toISOString().split('T')[0]
      const all = this.getAllProgress()

      if (this.isAuthenticated && this.token) {
        try {
          const res = await fetch(`/api/prayers?date=${todayKey}`, { headers: this.authHeaders() })
          if (res.ok) {
            const { data } = await res.json()
            this.applyDayData(all, todayKey, data)
            localStorage.setItem('prayerProgress', JSON.stringify(all))
          }
        } catch { /* fall through to localStorage */ }
      }

      this.todayData = all[todayKey] || {}
      const values = Object.values(this.todayData)
      this.todayStats = {
        prayed: values.filter(s => s === 'prayed').length,
        kaza: values.filter(s => s === 'kaza').length,
        missed: values.filter(s => s === 'missed').length
      }
    },

    async loadDailyData() {
      const all = this.getAllProgress()

      if (this.isAuthenticated && this.token) {
        try {
          const res = await fetch(`/api/prayers?date=${this.selectedDate}`, { headers: this.authHeaders() })
          if (res.ok) {
            const { data } = await res.json()
            this.applyDayData(all, this.selectedDate, data)
            localStorage.setItem('prayerProgress', JSON.stringify(all))
          }
        } catch { /* fall through to localStorage */ }
      }

      const data = all[this.selectedDate]
      if (data && Object.keys(data).length > 0) {
        this.selectedDateData = data
        this.hasSelectedDateData = true
        const values = Object.values(data)
        this.selectedDateStats = {
          prayed: values.filter(s => s === 'prayed').length,
          kaza: values.filter(s => s === 'kaza').length,
          missed: values.filter(s => s === 'missed').length
        }
      } else {
        this.selectedDateData = {}
        this.hasSelectedDateData = false
        this.selectedDateStats = { prayed: 0, kaza: 0, missed: 0 }
      }
    },

    async loadMonthlyData() {
      const [year, month] = this.selectedMonth.split('-')
      const all = this.getAllProgress()

      if (this.isAuthenticated && this.token) {
        try {
          const res = await fetch(`/api/prayers?month=${this.selectedMonth}`, { headers: this.authHeaders() })
          if (res.ok) {
            const { data } = await res.json()
            if (Array.isArray(data)) {
              data.forEach(row => this.applyDayData(all, row.date, row))
              localStorage.setItem('prayerProgress', JSON.stringify(all))
            }
          }
        } catch { /* fall through to localStorage */ }
      }

      const today = new Date()
      const lastDay = new Date(year, month, 0).getDate()

      let activeDays = 0
      let totalPrayed = 0
      let fullDays = 0

      this.monthlyCalendar = []

      for (let day = 1; day <= lastDay; day++) {
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const currentDate = new Date(year, month - 1, day)
        const dayData = all[isoDate] || {}
        const hasData = Object.keys(dayData).some(k => dayData[k])

        const prayedCount = Object.values(dayData).filter(s => s === 'prayed').length
        const kazaCount = Object.values(dayData).filter(s => s === 'kaza').length
        const missedCount = Object.values(dayData).filter(s => s === 'missed').length

        if (hasData) {
          activeDays++
          totalPrayed += prayedCount
          if (prayedCount + kazaCount === 5 && missedCount === 0) fullDays++
        }

        this.monthlyCalendar.push({
          isoDate,
          dayNumber: day,
          hasData,
          prayedCount,
          kazaCount,
          missedCount,
          isToday: currentDate.toDateString() === today.toDateString(),
          miniIcons: PRAYER_IDS.map(id => ({ id, status: dayData[id] || null }))
        })
      }

      this.monthlyStats = { activeDays, totalPrayed, fullDays }
    },

    statusLabel(status) {
      if (status === 'prayed') return this.$t('prayer.prayed')
      if (status === 'kaza') return this.$t('prayer.kaza')
      if (status === 'missed') return this.$t('prayer.missed')
      return '—'
    },

    formatDate(dateString) {
      return new Date(dateString + 'T12:00:00').toLocaleDateString(this.$i18n.locale, {
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

    viewDayDetails(isoDate) {
      this.selectedDate = isoDate
      this.currentView = 'daily'
      this.loadDailyData()
    }
  }
}
</script>

<style scoped>
.prayer-history {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.history-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
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
  font-size: 1.6rem;
  flex: 1;
  text-align: center;
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
  touch-action: manipulation;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.view-btn:hover,
.view-btn.active {
  background: rgba(255, 255, 255, 0.35);
}

.history-main {
  padding: 24px 16px;
  max-width: 720px;
  margin: 0 auto;
}

/* Stats summary */
.stats-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
}

.stat-card {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 2px 10px var(--shadow);
  flex: 1;
  border-top: 4px solid transparent;
}

.prayed-card { border-top-color: #16a34a; }
.kaza-card { border-top-color: #f59e0b; }
.missed-card { border-top-color: #ef4444; }

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.prayed-card .stat-number { color: #16a34a; }
.kaza-card .stat-number { color: #f59e0b; }
.missed-card .stat-number { color: #ef4444; }

.stat-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Prayers table */
.prayers-table-wrap h2,
.daily-data h2 {
  margin: 0 0 16px;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.prayers-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prayer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-card);
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 6px var(--shadow);
  border-left: 4px solid var(--border-color);
  transition: border-left-color 0.3s ease;
}

.prayer-row.prayed { border-left-color: #16a34a; }
.prayer-row.kaza { border-left-color: #f59e0b; }
.prayer-row.missed { border-left-color: #ef4444; }

.prayer-arabic-sm {
  font-size: 1.3rem;
  color: #16a34a;
  direction: rtl;
  min-width: 36px;
  text-align: center;
}

.prayer-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary);
}

.prayer-status-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.prayer-status-badge.prayed { background: rgba(22,163,74,0.15); color: #16a34a; }
.prayer-status-badge.kaza { background: rgba(245,158,11,0.15); color: #d97706; }
.prayer-status-badge.missed { background: rgba(239,68,68,0.15); color: #ef4444; }
.prayer-status-badge.pending { background: var(--bg-secondary); color: var(--text-secondary); }

/* CTA button */
.go-back-btn-wrap {
  text-align: center;
  margin-top: 24px;
}

.cta-btn {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s ease;
  touch-action: manipulation;
}

.cta-btn:hover { opacity: 0.9; }

/* Date/month selector */
.date-selector,
.month-selector {
  text-align: center;
  margin-bottom: 24px;
}

.date-input,
.month-input {
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-card);
  color: var(--text-primary);
}

/* Daily summary */
.daily-summary {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 24px;
}

.summary-stat {
  text-align: center;
}

.summary-stat span {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.summary-stat.prayed span { color: #16a34a; }
.summary-stat.kaza span { color: #f59e0b; }
.summary-stat.missed span { color: #ef4444; }

.summary-stat small { color: var(--text-secondary); }

/* Monthly summary */
.month-title {
  text-align: center;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.monthly-summary {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px var(--shadow);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-item {
  text-align: center;
}

.summary-number {
  display: block;
  font-size: 1.8rem;
  font-weight: bold;
  color: #16a34a;
  margin-bottom: 4px;
}

.summary-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Monthly calendar */
.monthly-calendar {
  background: var(--bg-card);
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 2px 10px var(--shadow);
}

.monthly-calendar h3 {
  margin: 0 0 16px;
  color: var(--text-primary);
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 4px 2px;
  touch-action: manipulation;
}

.calendar-day.today {
  border: 2px solid #16a34a;
}

.calendar-day.all-prayed {
  background: #dcfce7;
  color: #166534;
}

.calendar-day.good-progress {
  background: #fef9c3;
  color: #854d0e;
}

.calendar-day.some-missed {
  background: #fee2e2;
  color: #991b1b;
}

.calendar-day:hover {
  transform: scale(1.05);
}

.day-number {
  font-weight: 600;
  font-size: 0.85rem;
}

.day-icons {
  display: flex;
  gap: 2px;
  margin-top: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.mini-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d1d5db;
}

.mini-dot.prayed { background: #16a34a; }
.mini-dot.kaza { background: #f59e0b; }
.mini-dot.missed { background: #ef4444; }

.no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    text-align: center;
  }

  .history-header h1 {
    font-size: 1.3rem;
  }

  .stats-summary {
    gap: 10px;
  }

  .stat-card {
    padding: 14px 10px;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .daily-summary {
    gap: 20px;
  }

  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-day {
    padding: 2px 1px;
  }
}
</style>
