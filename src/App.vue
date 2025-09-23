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
    return { modals }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f8f9fa;
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
