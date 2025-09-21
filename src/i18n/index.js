import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'

// Get the browser language or fallback to 'en'
function getDefaultLocale() {
  const browserLang = navigator.language || navigator.userLanguage
  const supportedLocales = ['en', 'es', 'fr']
  
  // Check if browser language matches any supported locale
  for (const locale of supportedLocales) {
    if (browserLang.startsWith(locale)) {
      return locale
    }
  }
  
  return 'en' // fallback
}

const messages = {
  en,
  es,
  fr
}

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: getDefaultLocale(), // set locale from browser or default
  fallbackLocale: 'en', // set fallback locale
  messages, // set locale messages
  globalInjection: true // make $t available in all components
})

export default i18n

// Export function to change language
export function setLanguage(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale)
}

// Export function to get current language
export function getCurrentLanguage() {
  return i18n.global.locale.value
}

// Export function to get available languages
export function getAvailableLanguages() {
  return Object.keys(messages)
}