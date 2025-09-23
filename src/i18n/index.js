import { createI18n } from 'vue-i18n'

// Get the browser language or fallback to 'en'
function getDefaultLocale() {
  const savedLang = localStorage.getItem('language')
  if (savedLang) return savedLang
  
  const browserLang = navigator.language || navigator.userLanguage
  const supportedLocales = ['en', 'ar', 'es', 'fr']
  
  // Check if browser language matches any supported locale
  for (const locale of supportedLocales) {
    if (browserLang.startsWith(locale)) {
      return locale
    }
  }
  
  return 'en' // fallback
}

// Function to load translations from API
async function loadTranslations(locale) {
  try {
    const response = await fetch(`/api/translations?lang=${locale}`)
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      console.error('Failed to load translations:', data.message)
      return {}
    }
  } catch (error) {
    console.error('Error fetching translations:', error)
    return {}
  }
}

// Initialize with empty messages - will be loaded dynamically
const messages = {}

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: getDefaultLocale(), // set locale from browser or default
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
  globalInjection: true // make $t available in all components
})

// Load initial translations
async function initializeTranslations() {
  const defaultLocale = getDefaultLocale()
  const translations = await loadTranslations(defaultLocale)
  i18n.global.setLocaleMessage(defaultLocale, translations)
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
  localStorage.setItem('language', locale)
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