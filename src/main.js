import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAuth } from './composables/useAuth'

const app = createApp(App)

app.use(router)
app.use(i18n)

// Initialize auth before mounting
const { initAuth } = useAuth()
initAuth().then(() => {
  app.mount('#app')
})
