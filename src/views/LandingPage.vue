<template>
  <div class="landing-page">
    <!-- Header Section -->
    <header class="landing-header">
      <nav class="nav-container">
        <router-link to="/" class="logo-title-link">
          <div class="logo-section">
            <div class="logo-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span class="logo-title">MoiiFaith</span>
          </div>
        </router-link>
        <div class="nav-links">
          <button @click="toggleTheme" class="theme-toggle-btn" :title="isDark ? 'Light Mode' : 'Dark Mode'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <router-link to="/zikrs" class="nav-link app-link">{{ $t('zikr.openApp') }}</router-link>
          <router-link to="/login" class="nav-link">{{ $t('auth.login.button') }}</router-link>
          <router-link to="/register" class="nav-link">{{ $t('auth.register.button') }}</router-link>
          <div class="language-selector">
            <CustomSelect
              :options="languageOptions"
              v-model="currentLanguage"
              theme="landing"
              :placeholder="$t('language.current')"
            />
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>{{ $t('zikr.appName') }}</h1>
        <p class="hero-subtitle">{{ $t('zikr.appDescription') }}</p>
        <div class="hero-actions" v-if="!isAuthenticated">
          <router-link to="/register" class="cta-button primary">
            {{ $t('auth.register.button') }}
          </router-link>
          <router-link to="/login" class="cta-button secondary">
            {{ $t('auth.login.button') }}
          </router-link>
        </div>
        <div class="hero-actions" v-else>
          <router-link to="/zikrs" class="cta-button primary">
            {{ $t('zikr.startZikr') }}
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-phone-mockup">
          <div class="phone-screen">
            <div class="mock-header">
              <span class="mock-logo">📿</span>
              <span class="mock-title">Zikr Counter</span>
            </div>
            <div class="mock-counter">
              <div class="mock-circle">
                <span class="mock-count">33</span>
              </div>
              <span class="mock-label">سُبْحَانَ اللَّهِ</span>
            </div>
            <div class="mock-progress">
              <div class="mock-bar"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>{{ $t('zikr.featuresTitle') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🕌</div>
            <h3>{{ $t('zikr.feature1Title') }}</h3>
            <p>{{ $t('zikr.feature1Description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📿</div>
            <h3>{{ $t('zikr.feature2Title') }}</h3>
            <p>{{ $t('zikr.feature2Description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>{{ $t('zikr.feature3Title') }}</h3>
            <p>{{ $t('zikr.feature3Description') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌍</div>
            <h3>{{ $t('zikr.feature4Title') }}</h3>
            <p>{{ $t('zikr.feature4Description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Screenshots Section -->
    <section class="screenshots">
      <div class="container">
        <h2>{{ $t('zikr.screenshotsTitle') }}</h2>
        <div class="screenshots-grid">
          <div class="screenshot">
            <div class="screenshot-card">
              <div class="screenshot-icon">📿</div>
              <div class="screenshot-lines">
                <div class="line long"></div>
                <div class="line short"></div>
                <div class="line medium"></div>
              </div>
            </div>
            <p>{{ $t('zikr.screenshot1Caption') }}</p>
          </div>
          <div class="screenshot">
            <div class="screenshot-card">
              <div class="screenshot-icon">🔢</div>
              <div class="screenshot-counter-mock">
                <div class="counter-ring"></div>
              </div>
            </div>
            <p>{{ $t('zikr.screenshot2Caption') }}</p>
          </div>
          <div class="screenshot">
            <div class="screenshot-card">
              <div class="screenshot-icon">📊</div>
              <div class="screenshot-bars">
                <div class="bar" style="height: 40%"></div>
                <div class="bar" style="height: 70%"></div>
                <div class="bar" style="height: 55%"></div>
                <div class="bar" style="height: 90%"></div>
                <div class="bar" style="height: 65%"></div>
              </div>
            </div>
            <p>{{ $t('zikr.screenshot3Caption') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="final-cta">
      <div class="container">
        <h2>{{ $t('zikr.finalCtaTitle') }}</h2>
        <p>{{ $t('zikr.finalCtaDescription') }}</p>
        <div class="final-cta-actions" v-if="!isAuthenticated">
          <router-link to="/register" class="cta-button large primary">
            {{ $t('auth.register.button') }}
          </router-link>
          <router-link to="/login" class="cta-button large secondary">
            {{ $t('auth.login.button') }}
          </router-link>
        </div>
        <router-link v-else to="/zikrs" class="cta-button large primary">
          {{ $t('zikr.startNow') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import CustomSelect from '@/components/CustomSelect.vue'
import { setLanguage, getCurrentLanguage } from '@/i18n'

export default {
  name: 'LandingPage',
  components: {
    CustomSelect
  },
  setup() {
    const { isAuthenticated } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    
    return {
      isAuthenticated,
      isDark,
      toggleTheme
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
      ]
    }
  },
  mounted() {
    this.currentLanguage = getCurrentLanguage() || 'en'
  },
  watch: {
    async currentLanguage(newLanguage) {
      await setLanguage(newLanguage)
    }
  }
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
}

/* Header Styles */
.landing-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-container {
  width: 100%;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 40px;
  height: 40px;
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
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 10px;
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

.language-selector {
  margin-right: 0.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 700;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.3s ease;
  border: 2px solid white;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.9);
  color: #16a34a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link:hover {
  background: white;
  color: #15803d;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.app-link {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
}

.app-link:hover {
  background: linear-gradient(135deg, #15803d 0%, #166534 100%) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero {
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding: 100px 20px 60px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
  color: white;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.4rem;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-image {
  flex: 1;
  text-align: center;
  padding-left: 40px;
}

/* Hero Phone Mockup */
.hero-phone-mockup {
  width: 280px;
  margin: 0 auto;
  background: #1a1a2e;
  border-radius: 30px;
  padding: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.phone-screen {
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  border-radius: 20px;
  padding: 20px 16px;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  width: 100%;
}

.mock-logo {
  font-size: 1.5rem;
}

.mock-title {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.mock-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.mock-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(22, 163, 74, 0.4);
  margin-bottom: 16px;
}

.mock-count {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
}

.mock-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  direction: rtl;
  margin-bottom: 20px;
}

.mock-progress {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.mock-bar {
  width: 65%;
  height: 100%;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  border-radius: 3px;
}

.hero-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.cta-button:hover::before {
  left: 100%;
}

.cta-button.primary {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
  border-color: transparent;
}

.cta-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}

.cta-button:hover {
  transform: translateY(-2px);
}

.cta-button.primary:hover {
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.4);
}

/* Features Section */
.features {
  padding: 80px 0;
  background: var(--bg-secondary);
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: var(--bg-card);
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px var(--shadow);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Screenshots Section */
.screenshots {
  padding: 80px 0;
  background: var(--bg-primary);
}

.screenshots h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: var(--text-primary);
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.screenshot {
  text-align: center;
}

.screenshot-card {
  width: 100%;
  max-width: 260px;
  height: 320px;
  margin: 0 auto 20px;
  background: linear-gradient(180deg, #111827 0%, #1f2937 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(22, 163, 74, 0.2);
}

.screenshot-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.screenshot-lines {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.screenshot-lines .line {
  height: 10px;
  border-radius: 5px;
  background: rgba(22, 163, 74, 0.3);
}

.screenshot-lines .line.long { width: 100%; }
.screenshot-lines .line.short { width: 60%; }
.screenshot-lines .line.medium { width: 80%; }

.screenshot-counter-mock {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 6px solid #16a34a;
  box-shadow: 0 0 20px rgba(22, 163, 74, 0.3);
}

.screenshot-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  padding-top: 10px;
}

.screenshot-bars .bar {
  flex: 1;
  background: linear-gradient(180deg, #16a34a, #15803d);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
}

.screenshot p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

/* Final CTA Section */
.final-cta {
  background: linear-gradient(135deg, #1a1a2e 0%, #16a34a 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.final-cta h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.final-cta p {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
}

.final-cta-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    align-items: center;
  }
  
  .language-selector {
    margin-right: 0;
    margin-bottom: 0.5rem;
    order: -1; /* Put language selector at the top on mobile */
  }
  
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }

  .hero-image {
    padding-left: 0;
    margin-top: 40px;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .features h2,
  .screenshots h2,
  .final-cta h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .screenshots-grid {
    grid-template-columns: 1fr;
  }
}
</style>