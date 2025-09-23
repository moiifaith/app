import { Preferences } from '@capacitor/preferences'
import { useAuth } from '@/composables/useAuth'

const API_BASE = '/api'

export async function migrateLocalStorageData() {
  const { getAuthHeaders } = useAuth()
  
  try {
    // Get existing localStorage data
    const { value: zikrCountsJson } = await Preferences.get({ key: 'zikrCounts' })
    const { value: zikrHistoryJson } = await Preferences.get({ key: 'zikrHistory' })
    const { value: selectedLanguage } = await Preferences.get({ key: 'selectedLanguage' })
    
    let zikrCounts = {}
    let zikrHistory = []
    
    try {
      if (zikrCountsJson) {
        zikrCounts = JSON.parse(zikrCountsJson)
      }
      if (zikrHistoryJson) {
        zikrHistory = JSON.parse(zikrHistoryJson)
      }
    } catch (error) {
      console.error('Error parsing stored data:', error)
    }

    // Prepare migration data
    const migrationData = {
      zikrCounts,
      zikrHistory,
      language: selectedLanguage || 'en'
    }

    // Send to server
    const response = await fetch(`${API_BASE}/progress/migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(migrationData)
    })

    if (response.ok) {
      console.log('Data migration successful')
      
      // Optionally clear old data after successful migration
      // await Preferences.remove({ key: 'zikrCounts' })
      // await Preferences.remove({ key: 'zikrHistory' })
      
      return { success: true }
    } else {
      console.error('Migration failed:', await response.text())
      return { success: false, error: 'Migration failed' }
    }
  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error: 'Migration error' }
  }
}

export async function syncUserProgress() {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  
  if (!isAuthenticated.value) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Get user progress from server
    const response = await fetch(`${API_BASE}/progress`, {
      headers: getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      
      // Store synced data locally
      await Preferences.set({
        key: 'zikrCounts',
        value: JSON.stringify(data.zikrCounts || {})
      })
      
      await Preferences.set({
        key: 'zikrHistory',
        value: JSON.stringify(data.zikrHistory || [])
      })

      return { success: true, data }
    } else {
      return { success: false, error: 'Sync failed' }
    }
  } catch (error) {
    console.error('Sync error:', error)
    return { success: false, error: 'Sync error' }
  }
}

export async function saveProgressToServer(progressData) {
  const { getAuthHeaders, isAuthenticated } = useAuth()
  
  if (!isAuthenticated.value) {
    // If not authenticated, save locally only
    return saveProgressLocally(progressData)
  }

  try {
    const response = await fetch(`${API_BASE}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(progressData)
    })

    if (response.ok) {
      // Also save locally as backup
      await saveProgressLocally(progressData)
      return { success: true }
    } else {
      // Fallback to local storage
      return await saveProgressLocally(progressData)
    }
  } catch (error) {
    console.error('Error saving to server:', error)
    // Fallback to local storage
    return await saveProgressLocally(progressData)
  }
}

async function saveProgressLocally(progressData) {
  try {
    if (progressData.zikrCounts) {
      await Preferences.set({
        key: 'zikrCounts',
        value: JSON.stringify(progressData.zikrCounts)
      })
    }
    
    if (progressData.zikrHistory) {
      await Preferences.set({
        key: 'zikrHistory',
        value: JSON.stringify(progressData.zikrHistory)
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving locally:', error)
    return { success: false, error: 'Local save failed' }
  }
}
