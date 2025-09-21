<template>
  <div class="profile">
    <div class="container">
      <h1>{{ $t('profileTitle') }}</h1>
      
      <div class="profile-card">
        <div class="avatar">
          <div class="avatar-placeholder">
            {{ $t('avatarPlaceholder') }}
          </div>
        </div>
        
        <div class="profile-info">
          <h2>{{ $t('userName') }}</h2>
          <p class="email">{{ $t('userEmail') }}</p>
          
          <div class="stats">
            <div class="stat">
              <span class="stat-number">12</span>
              <span class="stat-label">{{ $t('projectsCount') }}</span>
            </div>
            <div class="stat">
              <span class="stat-number">4.8</span>
              <span class="stat-label">{{ $t('rating') }}</span>
            </div>
            <div class="stat">
              <span class="stat-number">150</span>
              <span class="stat-label">{{ $t('connectionsCount') }}</span>
            </div>
          </div>
          
          <button class="edit-btn">{{ $t('editProfile') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage'
}
</script>

<style scoped>
.profile {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.container h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.avatar {
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  background: #3498db;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.profile-info h2 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.email {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.edit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.edit-btn:hover {
  background: #2980b9;
}
</style>