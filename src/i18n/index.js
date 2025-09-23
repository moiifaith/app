import { createI18n } from 'vue-i18n'
import { Preferences } from '@capacitor/preferences'

// Get the browser language or fallback to 'en'
async function getDefaultLocale() {
  // Try to get saved language from Capacitor Preferences
  const { value: savedLang } = await Preferences.get({ key: 'language' })
  if (savedLang) return savedLang
  
  const browserLang = navigator.language || navigator.userLanguage
  const supportedLocales = ['en', 'ar', 'es', 'fr', 'bs', 'hr', 'sr']
  
  // Check if browser language matches any supported locale
  for (const locale of supportedLocales) {
    if (browserLang.startsWith(locale)) {
      return locale
    }
  }
  
  return 'en' // fallback
}

// Function to get cached translation version
async function getCachedTranslationVersion(locale) {
  try {
    const { value } = await Preferences.get({ key: `translation_version_${locale}` })
    return value
  } catch (error) {
    console.error('Error getting cached version:', error)
    return null
  }
}

// Function to get cached translations
async function getCachedTranslations(locale) {
  try {
    const { value } = await Preferences.get({ key: `translations_${locale}` })
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error('Error getting cached translations:', error)
    return null
  }
}

// Function to cache translations
async function cacheTranslations(locale, translations, version) {
  try {
    await Preferences.set({ 
      key: `translations_${locale}`, 
      value: JSON.stringify(translations) 
    })
    if (version) {
      await Preferences.set({ 
        key: `translation_version_${locale}`, 
        value: version 
      })
    }
  } catch (error) {
    console.error('Error caching translations:', error)
  }
}

// Function to check if translations are up to date
async function checkTranslationVersion(locale) {
  try {
    const response = await fetch(`/api/translations/version?lang=${locale}`)
    const data = await response.json()
    
    if (data.success) {
      const cachedVersion = await getCachedTranslationVersion(locale)
      return {
        needsUpdate: cachedVersion !== data.version,
        version: data.version
      }
    }
    return { needsUpdate: true, version: null }
  } catch (error) {
    console.error('Error checking translation version:', error)
    return { needsUpdate: true, version: null }
  }
}

// Function to load translations from API or cache
async function loadTranslations(locale) {
  try {
    // Check if we need to update translations
    const { needsUpdate, version } = await checkTranslationVersion(locale)
    
    if (!needsUpdate) {
      // Use cached translations
      const cachedTranslations = await getCachedTranslations(locale)
      if (cachedTranslations) {
        console.log(`Using cached translations for ${locale}`)
        return cachedTranslations
      }
    }
    
    // Fetch fresh translations from API
    console.log(`Fetching fresh translations for ${locale}`)
    const response = await fetch(`/api/translations?lang=${locale}`)
    const data = await response.json()
    
    if (data.success) {
      // Cache the new translations
      await cacheTranslations(locale, data.data, version)
      return data.data
    } else {
      console.error('Failed to load translations:', data.message)
      
      // Fallback to cached translations if API fails
      const cachedTranslations = await getCachedTranslations(locale)
      return cachedTranslations || {}
    }
  } catch (error) {
    console.error('Error fetching translations:', error)
    
    // Fallback to cached translations if API fails
    const cachedTranslations = await getCachedTranslations(locale)
    return cachedTranslations || {}
  }
}

// Initialize with empty messages - will be loaded dynamically
const messages = {}

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: 'en', // will be set after async initialization
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
  globalInjection: true // make $t available in all components
})

// Load initial translations
async function initializeTranslations() {
  const defaultLocale = await getDefaultLocale()
  const translations = await loadTranslations(defaultLocale)
  i18n.global.setLocaleMessage(defaultLocale, translations)
  i18n.global.locale.value = defaultLocale
}

// Initialize translations when the module loads
initializeTranslations()

export default i18n

// Export function to change language
export async function setLanguage(locale) {
  // Load translations for the new locale if not already loaded
  if (!i18n.global.availableLocales.includes(locale)) {
    const translations = await loadTranslations(locale)
    i18n.global.setLocaleMessage(locale, translations)
  }
  
  i18n.global.locale.value = locale
  await Preferences.set({ key: 'language', value: locale })
}

// Export function to get available languages from API
export async function getAvailableLanguages() {
  try {
    const response = await fetch('/api/languages')
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      console.error('Failed to load languages:', data.message)
      return []
    }
  } catch (error) {
    console.error('Error fetching languages:', error)
    return []
  }
}

// Export function to get current language
export function getCurrentLanguage() {
  return i18n.global.locale.value
}