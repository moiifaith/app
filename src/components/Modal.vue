<template>
  <Transition name="modal-overlay" appear>
    <div 
      v-if="show" 
      class="modal-overlay"
      @click="handleOverlayClick"
    >
      <Transition name="modal-content" appear>
        <div 
          v-if="show"
          class="modal-content"
          :class="modalClass"
          @click.stop
        >
          <!-- Header -->
          <div class="modal-header" v-if="title || $slots.header">
            <slot name="header">
              <h3 class="modal-title">{{ title }}</h3>
            </slot>
            <button 
              v-if="closable"
              @click="close"
              class="modal-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div v-if="type === 'confirm'" class="confirm-content">
              <div class="confirm-icon" :class="`confirm-${confirmType}`">
                <span v-if="confirmType === 'danger'">⚠️</span>
                <span v-else-if="confirmType === 'success'">✅</span>
                <span v-else-if="confirmType === 'info'">ℹ️</span>
                <span v-else>❓</span>
              </div>
              <div class="confirm-message">
                {{ message }}
              </div>
            </div>
            <div v-else-if="type === 'alert'" class="alert-content">
              <div class="alert-icon" :class="`alert-${alertType}`">
                <span v-if="alertType === 'success'">✅</span>
                <span v-else-if="alertType === 'error'">❌</span>
                <span v-else-if="alertType === 'warning'">⚠️</span>
                <span v-else>ℹ️</span>
              </div>
              <div class="alert-message">
                {{ message }}
              </div>
            </div>
            <slot v-else></slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer" v-if="showFooter">
            <slot name="footer">
              <div v-if="type === 'confirm'" class="confirm-buttons">
                <button 
                  @click="handleConfirm"
                  class="btn btn-primary"
                  :class="{ 'btn-danger': confirmType === 'danger' }"
                >
                  {{ confirmText || $t('common.confirm') || 'Confirm' }}
                </button>
                <button 
                  @click="handleCancel"
                  class="btn btn-secondary"
                >
                  {{ cancelText || $t('common.cancel') || 'Cancel' }}
                </button>
              </div>
              <div v-else-if="type === 'alert'" class="alert-buttons">
                <button 
                  @click="close"
                  class="btn btn-primary"
                >
                  {{ okText || $t('common.ok') || 'OK' }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'AppModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'default', // 'default', 'confirm', 'alert'
    },
    confirmType: {
      type: String,
      default: 'warning' // 'warning', 'danger', 'success', 'info'
    },
    alertType: {
      type: String,
      default: 'info' // 'success', 'error', 'warning', 'info'
    },
    confirmText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: ''
    },
    okText: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'medium' // 'small', 'medium', 'large'
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    modalClass() {
      return `modal-${this.size}`
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleConfirm() {
      this.$emit('confirm')
      this.close()
    },
    handleCancel() {
      this.$emit('cancel')
      this.close()
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-small {
  width: 400px;
}

.modal-medium {
  width: 500px;
}

.modal-large {
  width: 700px;
}

.modal-header {
  padding: 20px 25px 15px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
}

.confirm-content, .alert-content {
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
}

.confirm-icon, .alert-icon {
  font-size: 3rem;
  flex-shrink: 0;
  animation: iconPulse 0.6s ease-out;
}

@keyframes iconPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.confirm-message, .alert-message {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #2c3e50;
  animation: messageFadeIn 0.5s ease-out 0.2s both;
}

@keyframes messageFadeIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-footer {
  padding: 15px 25px 25px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #e9ecef;
}

.confirm-buttons, .alert-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.btn-danger:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
}

.btn-secondary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

/* Transitions */
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

@media (max-width: 768px) {
  .modal-small,
  .modal-medium,
  .modal-large {
    width: 100%;
    max-width: 90vw;
  }
  
  .modal-header {
    padding: 15px 20px 10px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 10px 20px 20px;
  }
  
  .confirm-content, .alert-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .confirm-buttons, .alert-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
