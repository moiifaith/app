import { ref, watch } from 'vue'

const isDark = ref(false)
let initialized = false

function applyTheme(dark) {
  const root = document.documentElement
  if (dark) {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
}

export function useTheme() {
  if (!initialized) {
    const saved = localStorage.getItem('moiifaith-theme')
    if (saved === 'dark') {
      isDark.value = true
    } else if (saved === null) {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme(isDark.value)
    initialized = true
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  watch(isDark, (val) => {
    applyTheme(val)
    localStorage.setItem('moiifaith-theme', val ? 'dark' : 'light')
  })

  return {
    isDark,
    toggleTheme
  }
}
