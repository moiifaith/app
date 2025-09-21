<template>
  <div class="home">
    <div class="hero">
      <img alt="Vue logo" src="../assets/logo.png">
      <h1>{{ $t('welcome') }}</h1>
      <p>{{ $t('homeDescription') }}</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <h3>{{ $t('feature1Title') }}</h3>
        <p>{{ $t('feature1Description') }}</p>
      </div>
      
      <div class="feature-card">
        <h3>{{ $t('feature2Title') }}</h3>
        <p>{{ $t('feature2Description') }}</p>
      </div>
      
      <div class="feature-card">
        <h3>{{ $t('feature3Title') }}</h3>
        <p>{{ $t('feature3Description') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}

.hero img {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.hero p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.feature-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.feature-card p {
  color: #6c757d;
  line-height: 1.6;
}
</style>