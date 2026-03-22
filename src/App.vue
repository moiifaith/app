<template>
  <div id="app">
    <main class="main-content">
      <PageTransition name="scale">
        <router-view :key="$route.fullPath"/>
      </PageTransition>
    </main>

    <!-- Global Modal System -->
    <AppModal
      v-for="modal in modals"
      :key="modal.id"
      :show="modal.show"
      :title="modal.title"
      :message="modal.message"
      :type="modal.type"
      :confirm-type="modal.confirmType"
      :alert-type="modal.alertType"
      :confirm-text="modal.confirmText"
      :cancel-text="modal.cancelText"
      :ok-text="modal.okText"
      @confirm="modal.onConfirm"
      @cancel="modal.onCancel"
      @close="modal.onClose"
    />
  </div>
</template>

<script>
import { useModal } from './composables/useModal'
import { useTheme } from './composables/useTheme'
import AppModal from './components/Modal.vue'
import PageTransition from './components/PageTransition.vue'

export default {
  name: 'App',
  components: {
    AppModal,
    PageTransition
  },
  setup() {
    const { modals } = useModal()
    useTheme()
    return { modals }
  }
}
</script>

<style>
/* Light Mode (default) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --accent: #16a34a;
  --accent-hover: #15803d;
  --accent-light: rgba(22, 163, 74, 0.1);
  --header-bg: rgba(255, 255, 255, 0.95);
  --shadow: rgba(0, 0, 0, 0.1);
  --input-bg: #ffffff;
  --input-border: #dee2e6;
}

/* Dark Mode */
:root[data-theme="dark"] {
  --bg-primary: #222222;
  --bg-secondary: #1a1a1a;
  --bg-card: #2a2a2a;
  --bg-completed: #2d3a2e;
  --text-primary: #e8e8e8;
  --text-secondary: #a0a0a0;
  --border-color: #3a3a3a;
  --accent: #16a34a;
  --accent-hover: #22c55e;
  --accent-light: rgba(22, 163, 74, 0.15);
  --header-bg: rgba(34, 34, 34, 0.95);
  --shadow: rgba(0, 0, 0, 0.3);
  --input-bg: #333333;
  --input-border: #444444;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-secondary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0;
  }
}
</style>
