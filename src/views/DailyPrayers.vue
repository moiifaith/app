<template>
  <div class="daily-prayers">
    <header class="prayers-header">
      <button @click="goBack" class="back-btn">← {{ $t('prayer.back') }}</button>
      <div class="header-center">
        <h1>{{ $t('prayer.dailyPrayers') }}</h1>
        <p class="header-date">{{ formattedDate }}</p>
      </div>
      <button @click="goToHistory" class="history-btn">{{ $t('prayer.viewHistory') }}</button>
    </header>

    <main class="prayers-main">
      <!-- Summary bar -->
      <div class="summary-bar">
        <div class="summary-item prayed">
          <span class="summary-count">{{ summaryStats.prayed }}</span>
          <span class="summary-label">{{ $t('prayer.prayedCount') }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item kaza">
          <span class="summary-count">{{ summaryStats.kaza }}</span>
          <span class="summary-label">{{ $t('prayer.kazaCount') }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item missed">
          <span class="summary-count">{{ summaryStats.missed }}</span>
          <span class="summary-label">{{ $t('prayer.missedCount') }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item pending">
          <span class="summary-count">{{ summaryStats.pending }}</span>
          <span class="summary-label">{{ $t('zikr.incomplete') }}</span>
        </div>
      </div>

      <!-- Completion banner -->
      <div v-if="allMarked && summaryStats.missed === 0" class="completion-banner">
        {{ $t('prayer.allPrayed') }}
      </div>

      <!-- Progress dots -->
      <div class="progress-dots">
        <div
          v-for="prayer in prayers"
          :key="prayer.id"
          class="progress-dot"
          :class="prayerStatus[prayer.id] || 'pending'"
        ></div>
      </div>

      <!-- Prayer cards -->
      <div class="prayer-list">
        <div
          v-for="prayer in prayers"
          :key="prayer.id"
          class="prayer-card"
          :class="prayerStatus[prayer.id] || 'pending'"
        >
          <div class="prayer-info">
            <div class="prayer-arabic">{{ prayer.arabic }}</div>
            <div class="prayer-names">
              <span class="prayer-local">{{ $t('prayer.' + prayer.id) }}</span>
              <span class="prayer-time">{{ $t('prayer.' + prayer.id + 'Time') }}</span>
            </div>
          </div>

          <div class="prayer-buttons">
            <button
              class="status-btn prayed-btn"
              :class="{ active: prayerStatus[prayer.id] === 'prayed' }"
              @click="setPrayerStatus(prayer.id, 'prayed')"
              :title="$t('prayer.prayed')"
            >
              ✓ {{ $t('prayer.prayed') }}
            </button>
            <button
              class="status-btn kaza-btn"
              :class="{ active: prayerStatus[prayer.id] === 'kaza' }"
              @click="setPrayerStatus(prayer.id, 'kaza')"
              :title="$t('prayer.kaza')"
            >
              ↻ {{ $t('prayer.kaza') }}
            </button>
            <button
              class="status-btn missed-btn"
              :class="{ active: prayerStatus[prayer.id] === 'missed' }"
              @click="setPrayerStatus(prayer.id, 'missed')"
              :title="$t('prayer.missed')"
            >
              ✗ {{ $t('prayer.missed') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_ARABIC = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء'
}

export default {
  name: 'DailyPrayers',
  data() {
    return {
      prayers: PRAYER_IDS.map(id => ({ id, arabic: PRAYER_ARABIC[id] })),
      prayerStatus: {
        fajr: null,
        dhuhr: null,
        asr: null,
        maghrib: null,
        isha: null
      }
    }
  },
  computed: {
    todayKey() {
      return new Date().toISOString().split('T')[0]
    },
    formattedDate() {
      return new Date().toLocaleDateString(this.$i18n.locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    summaryStats() {
      const statuses = Object.values(this.prayerStatus)
      return {
        prayed: statuses.filter(s => s === 'prayed').length,
        kaza: statuses.filter(s => s === 'kaza').length,
        missed: statuses.filter(s => s === 'missed').length,
        pending: statuses.filter(s => !s).length
      }
    },
    allMarked() {
      return Object.values(this.prayerStatus).every(s => s !== null)
    }
  },
  mounted() {
    this.loadFromStorage()
  },
  methods: {
    loadFromStorage() {
      const all = JSON.parse(localStorage.getItem('prayerProgress') || '{}')
      const todayData = all[this.todayKey]
      if (todayData) {
        PRAYER_IDS.forEach(id => {
          this.prayerStatus[id] = todayData[id] || null
        })
      }
    },
    setPrayerStatus(prayerId, status) {
      // Toggle off if already selected
      if (this.prayerStatus[prayerId] === status) {
        this.prayerStatus[prayerId] = null
      } else {
        this.prayerStatus[prayerId] = status
      }
      this.saveToStorage()
    },
    saveToStorage() {
      const all = JSON.parse(localStorage.getItem('prayerProgress') || '{}')
      all[this.todayKey] = { ...this.prayerStatus }
      localStorage.setItem('prayerProgress', JSON.stringify(all))
    },
    goBack() {
      this.$router.push('/zikrs')
    },
    goToHistory() {
      this.$router.push('/prayers/history')
    }
  }
}
</script>

<style scoped>
.daily-prayers {
  min-height: 100vh;
  background: var(--bg-secondary);
  touch-action: manipulation;
}

.prayers-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.header-center {
  text-align: center;
  flex: 1;
}

.prayers-header h1 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
}

.header-date {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

.back-btn,
.history-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  touch-action: manipulation;
}

.back-btn:hover,
.history-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.prayers-main {
  max-width: 680px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Summary bar */
.summary-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px var(--shadow);
  gap: 0;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-count {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.summary-item.prayed .summary-count { color: #16a34a; }
.summary-item.kaza .summary-count { color: #f59e0b; }
.summary-item.missed .summary-count { color: #ef4444; }
.summary-item.pending .summary-count { color: var(--text-secondary); }

.summary-divider {
  width: 1px;
  height: 36px;
  background: var(--border-color);
  margin: 0 4px;
}

/* Completion banner */
.completion-banner {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: white;
  text-align: center;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 16px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Progress dots */
.progress-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.progress-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-color);
  transition: background 0.3s ease;
}

.progress-dot.prayed { background: #16a34a; }
.progress-dot.kaza { background: #f59e0b; }
.progress-dot.missed { background: #ef4444; }
.progress-dot.pending { background: var(--border-color); }

/* Prayer list */
.prayer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prayer-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 16px 18px;
  box-shadow: 0 2px 10px var(--shadow);
  border-left: 5px solid var(--border-color);
  transition: all 0.25s ease;
}

.prayer-card.prayed { border-left-color: #16a34a; }
.prayer-card.kaza { border-left-color: #f59e0b; }
.prayer-card.missed { border-left-color: #ef4444; }
.prayer-card.pending { border-left-color: var(--border-color); }

.prayer-info {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.prayer-arabic {
  font-size: 1.6rem;
  line-height: 1;
  color: #16a34a;
  direction: rtl;
  min-width: 48px;
  text-align: center;
}

.prayer-names {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.prayer-local {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.prayer-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Status buttons */
.prayer-buttons {
  display: flex;
  gap: 8px;
}

.status-btn {
  flex: 1;
  padding: 9px 6px;
  border-radius: 10px;
  border: 2px solid transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.status-btn:hover {
  opacity: 0.85;
}

/* Prayed button */
.prayed-btn { border-color: #16a34a; }
.prayed-btn:hover { background: rgba(22, 163, 74, 0.1); color: #16a34a; }
.prayed-btn.active { background: #16a34a; color: white; border-color: #16a34a; }

/* Kaza button */
.kaza-btn { border-color: #f59e0b; }
.kaza-btn:hover { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.kaza-btn.active { background: #f59e0b; color: white; border-color: #f59e0b; }

/* Missed button */
.missed-btn { border-color: #ef4444; }
.missed-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.missed-btn.active { background: #ef4444; color: white; border-color: #ef4444; }

/* Responsive */
@media (max-width: 480px) {
  .prayers-header {
    padding: 14px 12px;
  }

  .prayers-header h1 {
    font-size: 1.2rem;
  }

  .back-btn,
  .history-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .prayer-arabic {
    font-size: 1.35rem;
  }

  .status-btn {
    font-size: 0.72rem;
    padding: 8px 4px;
  }
}
</style>
