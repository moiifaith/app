<template>
  <div class="zikr-counter" @keydown.space.prevent="incrementCounter" tabindex="0">
    <header class="counter-header">
      <button @click="goBack" class="back-btn">← {{ $t('zikr.back') }}</button>
      <button @click="saveAndExit" class="save-btn">{{ $t('zikr.saveAndExit') }}</button>
    </header>

    <main class="counter-main">
      <div class="zikr-display">
        <h1 class="zikr-arabic">{{ currentZikr.arabic }}</h1>
        <h2 class="zikr-latin">{{ currentZikr.latin }}</h2>
        <p class="zikr-description">{{ getZikrDescription(currentZikr.identifier) }}</p>
      </div>

      <div class="counter-section">
        <div class="counter-display">
          <span class="counter-current">{{ currentCount }}</span>
          <span class="counter-total">/ {{ targetCount }}</span>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <div class="counter-controls">
          <button 
            @click="incrementCounter" 
            class="counter-btn main-counter"
            :class="{ completed: isCompleted }"
          >
            {{ isCompleted ? $t('zikr.completed') : $t('zikr.tapToCount') }}
          </button>
          
          <div class="secondary-controls">
            <button @click="decrementCounter" :disabled="currentCount === 0" class="control-btn">
              -1
            </button>
            <button @click="resetCounter" class="control-btn reset">
              {{ $t('zikr.reset') }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isCompleted" class="completion-message">
        <h3>{{ $t('zikr.completionMessage') }}</h3>
        <p>{{ $t('zikr.completionDescription') }}</p>
        <div class="completion-actions">
          <button @click="saveAndExit" class="cta-btn">
            {{ $t('zikr.saveProgress') }}
          </button>
          <button @click="continueZikr" class="secondary-btn">
            {{ $t('zikr.continue') }}
          </button>
        </div>
      </div>
    </main>

    <div class="counter-instructions">
      <p>{{ $t('zikr.instructions') }}</p>
    </div>
  </div>
</template>

<script>
import { zikrData } from '../data/zikrs'
import { zikrDescriptions } from '../data/zikrDescriptions'

export default {
  name: 'ZikrCounter',
  props: ['id'],
  data() {
    return {
      currentZikr: {},
      currentCount: 0,
      targetCount: 33,
      descriptions: {},
      sessionStartTime: null
    }
  },
  computed: {
    progressPercentage() {
      return Math.min((this.currentCount / this.targetCount) * 100, 100)
    },
    isCompleted() {
      return this.currentCount >= this.targetCount
    }
  },
  mounted() {
    this.initializeCounter()
    this.focusCounter()
  },
  methods: {
    initializeCounter() {
      // Find the zikr by ID
      this.currentZikr = zikrData.find(z => z.id === parseInt(this.id))
      if (!this.currentZikr) {
        this.$router.push('/app')
        return
      }

      // Get target count from query or use default
      this.targetCount = parseInt(this.$route.query.repetitions) || this.currentZikr.defaultRepetitions

      // Load descriptions
      const currentLanguage = localStorage.getItem('selectedLanguage') || 'en'
      this.descriptions = zikrDescriptions[currentLanguage] || zikrDescriptions.en

      // Load any existing progress for today
      const today = new Date().toDateString()
      const savedProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      const todayKey = `${this.id}_${today}`
      
      if (savedProgress[todayKey]) {
        this.currentCount = savedProgress[todayKey].count || 0
      }

      this.sessionStartTime = new Date()
    },

    focusCounter() {
      this.$el.focus()
    },

    incrementCounter() {
      if (this.currentCount < this.targetCount) {
        this.currentCount++
        this.saveProgress()
        
        // Haptic feedback for mobile
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
    },

    decrementCounter() {
      if (this.currentCount > 0) {
        this.currentCount--
        this.saveProgress()
      }
    },

    resetCounter() {
      if (confirm(this.$t('zikr.confirmReset'))) {
        this.currentCount = 0
        this.saveProgress()
      }
    },

    continueZikr() {
      this.targetCount += this.currentZikr.defaultRepetitions
    },

    saveProgress() {
      const today = new Date().toDateString()
      const todayKey = `${this.id}_${today}`
      
      // Save to detailed progress
      const savedProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
      savedProgress[todayKey] = {
        zikrId: this.id,
        count: this.currentCount,
        targetCount: this.targetCount,
        date: today,
        lastUpdated: new Date().toISOString(),
        completed: this.currentCount >= this.targetCount
      }
      localStorage.setItem('zikrProgress', JSON.stringify(savedProgress))

      // Save to today's summary
      const todayProgress = JSON.parse(localStorage.getItem('todayZikrProgress') || '{}')
      todayProgress[this.id] = {
        completed: this.currentCount >= this.targetCount,
        count: this.currentCount,
        targetCount: this.targetCount,
        date: today
      }
      localStorage.setItem('todayZikrProgress', JSON.stringify(todayProgress))
    },

    saveAndExit() {
      this.saveProgress()
      
      // Save session summary
      const sessionData = {
        zikrId: this.id,
        startTime: this.sessionStartTime,
        endTime: new Date(),
        finalCount: this.currentCount,
        targetCount: this.targetCount,
        completed: this.isCompleted
      }
      
      const sessions = JSON.parse(localStorage.getItem('zikrSessions') || '[]')
      sessions.push(sessionData)
      localStorage.setItem('zikrSessions', JSON.stringify(sessions))

      this.$router.push('/app')
    },

    goBack() {
      if (this.currentCount > 0) {
        if (confirm(this.$t('zikr.confirmExit'))) {
          this.saveAndExit()
        }
      } else {
        this.$router.push('/app')
      }
    },

    getZikrDescription(identifier) {
      return this.descriptions[identifier] || ''
    }
  }
}
</script>

<style scoped>
.zikr-counter {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  outline: none;
}

.counter-header {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
}

.back-btn, .save-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover, .save-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.counter-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.zikr-display {
  margin-bottom: 40px;
}

.zikr-arabic {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 15px 0;
  text-align: center;
  direction: rtl;
  line-height: 1.4;
}

.zikr-latin {
  font-size: 1.5rem;
  margin: 0 0 15px 0;
  opacity: 0.9;
  font-style: italic;
}

.zikr-description {
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 600px;
  line-height: 1.6;
  margin: 0;
}

.counter-section {
  margin-bottom: 40px;
}

.counter-display {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.counter-current {
  color: #fff;
}

.counter-total {
  opacity: 0.7;
  font-size: 0.7em;
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin: 0 auto 30px auto;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.counter-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.main-counter {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.main-counter:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.main-counter:active {
  transform: scale(0.95);
}

.main-counter.completed {
  background: rgba(40, 167, 69, 0.3);
  border-color: rgba(40, 167, 69, 0.5);
}

.secondary-controls {
  display: flex;
  gap: 15px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.reset {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.3);
}

.completion-message {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 20px;
}

.completion-message h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.completion-message p {
  margin: 0 0 20px 0;
  opacity: 0.9;
}

.completion-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cta-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cta-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.secondary-btn {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 25px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.counter-instructions {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0.8;
}

.counter-instructions p {
  margin: 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .zikr-arabic {
    font-size: 2rem;
  }

  .zikr-latin {
    font-size: 1.2rem;
  }

  .counter-display {
    font-size: 3rem;
  }

  .main-counter {
    width: 150px;
    height: 150px;
    font-size: 1rem;
  }

  .progress-bar {
    width: 250px;
  }

  .completion-actions {
    flex-direction: column;
  }
}
</style>