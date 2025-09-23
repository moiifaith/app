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
          <router-link to="/zikrs" class="nav-link app-link">Open App</router-link>
          <router-link to="/login" class="nav-link">{{ $t('auth.login.button') }}</router-link>
          <router-link to="/register" class="nav-link">{{ $t('auth.register.button') }}</router-link>
          <div class="language-selector">
            <CustomSelect
              :options="languageOptions"
              v-model="currentLanguage"
              theme="landing"
              placeholder="Language"
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
        <img src="../assets/zikr-hero-placeholder.png" alt="Zikr App Preview" />
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
            <img src="../assets/screenshot-1-placeholder.png" alt="Zikr List" />
            <p>{{ $t('zikr.screenshot1Caption') }}</p>
          </div>
          <div class="screenshot">
            <img src="../assets/screenshot-2-placeholder.png" alt="Zikr Counter" />
            <p>{{ $t('zikr.screenshot2Caption') }}</p>
          </div>
          <div class="screenshot">
            <img src="../assets/screenshot-3-placeholder.png" alt="Zikr History" />
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
import CustomSelect from '@/components/CustomSelect.vue'

export default {
  name: 'LandingPage',
  components: {
    CustomSelect
  },
  setup() {
    const { isAuthenticated } = useAuth()
    
    return {
      isAuthenticated
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
    // Initialize current language from i18n or localStorage
    this.currentLanguage = this.$i18n.locale || localStorage.getItem('selectedLanguage') || 'en'
  },
  watch: {
    currentLanguage(newLanguage) {
      console.log('LandingPage: language changed to', newLanguage)
      this.$i18n.locale = newLanguage
      localStorage.setItem('selectedLanguage', newLanguage)
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
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link:hover {
  background: white;
  color: #5a6fd8;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.app-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.app-link:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4c93 100%) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.hero-image img {
  max-width: 400px;
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Features Section */
.features {
  padding: 80px 0;
  background: #f8f9fa;
}

.features h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
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
  color: #2c3e50;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}

/* Screenshots Section */
.screenshots {
  padding: 80px 0;
}

.screenshots h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #2c3e50;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.screenshot {
  text-align: center;
}

.screenshot img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
}

.screenshot p {
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 500;
}

/* Final CTA Section */
.final-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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