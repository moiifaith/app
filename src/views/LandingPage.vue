<template>
  <div class="landing-page">
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
          <router-link to="/zikr-app" class="cta-button primary">
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
        <router-link v-else to="/zikr-app" class="cta-button large primary">
          {{ $t('zikr.startNow') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'LandingPage',
  setup() {
    const { isAuthenticated } = useAuth()
    
    return {
      isAuthenticated
    }
  }
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
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
  min-height: 80vh;
  padding: 60px 20px;
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
  background: #ff6b6b;
  color: white;
  padding: 15px 30px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.cta-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cta-button.secondary {
  background: transparent;
  border: 2px solid white;
  color: white;
  box-shadow: none;
}

.cta-button.secondary:hover {
  background: white;
  color: #667eea;
}

.cta-button:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
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