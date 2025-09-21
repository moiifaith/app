<template>
  <div class="about">
    <div class="container">
      <h1>{{ $t('aboutTitle') }}</h1>
      <p>{{ $t('aboutDescription') }}</p>
      
      <div class="about-content">
        <div class="section">
          <h2>{{ $t('missionTitle') }}</h2>
          <p>{{ $t('missionDescription') }}</p>
        </div>
        
        <div class="section">
          <h2>{{ $t('visionTitle') }}</h2>
          <p>{{ $t('visionDescription') }}</p>
        </div>
        
        <div class="section">
          <h2>{{ $t('contactTitle') }}</h2>
          <p>{{ $t('contactDescription') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
.about {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.container h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.about-content {
  margin-top: 30px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section h2 {
  color: #34495e;
  margin-bottom: 15px;
}

.section p {
  color: #6c757d;
  line-height: 1.6;
}
</style>