import { useAuth } from '@/composables/useAuth'

const API_BASE = '/api'
const MIGRATION_FLAG_KEY = 'zikrProgressMigrated'

/**
 * On first login, push any existing localStorage progress to the server.
 * Safe to call multiple times — skips immediately after the first successful run.
 */
export async function migrateLocalStorageToServer() {
  const { getAuthHeaders } = useAuth()

  // Already migrated on this device
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) return { success: true, skipped: true }

  const zikrProgress = JSON.parse(localStorage.getItem('zikrProgress') || '{}')
  const progressEntries = Object.values(zikrProgress)

  if (progressEntries.length === 0) {
    localStorage.setItem(MIGRATION_FLAG_KEY, '1')
    return { success: true, skipped: true }
  }

  // Convert from { "id_DateString": { zikrId, count, targetCount, date, completed } }
  // to the server format { zikrId, date (YYYY-MM-DD), count, targetCount, completed }
  const progress = progressEntries
    .map(entry => {
      let dateISO
      try {
        dateISO = new Date(entry.date).toISOString().split('T')[0]
      } catch (_) {
        dateISO = new Date().toISOString().split('T')[0]
      }
      return {
        zikrId: parseInt(entry.zikrId),
        date: dateISO,
        count: entry.count || 0,
        targetCount: entry.targetCount || 33,
        completed: !!entry.completed
      }
    })
    .filter(e => !isNaN(e.zikrId) && e.count > 0)

  if (progress.length === 0) {
    localStorage.setItem(MIGRATION_FLAG_KEY, '1')
    return { success: true, skipped: true }
  }

  try {
    const response = await fetch(`${API_BASE}/progress/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ progress })
    })

    if (response.ok) {
      localStorage.setItem(MIGRATION_FLAG_KEY, '1')
      return { success: true }
    } else {
      return { success: false, error: 'Migration failed' }
    }
  } catch (_) {
    return { success: false, error: 'Network error' }
  }
}
