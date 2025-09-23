import { ref } from 'vue'

// Global modal state
const modals = ref([])
let modalId = 0

export function useModal() {
  // Show alert modal
  const showAlert = (message, options = {}) => {
    return new Promise((resolve) => {
      const id = ++modalId
      const modal = {
        id,
        show: true,
        type: 'alert',
        message,
        alertType: options.type || 'info',
        title: options.title || '',
        okText: options.okText || '',
        onConfirm: () => {
          closeModal(id)
          resolve(true)
        },
        onClose: () => {
          closeModal(id)
          resolve(true)
        }
      }
      modals.value.push(modal)
    })
  }

  // Show confirm modal
  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const id = ++modalId
      const modal = {
        id,
        show: true,
        type: 'confirm',
        message,
        confirmType: options.type || 'warning',
        title: options.title || '',
        confirmText: options.confirmText || '',
        cancelText: options.cancelText || '',
        onConfirm: () => {
          closeModal(id)
          resolve(true)
        },
        onCancel: () => {
          closeModal(id)
          resolve(false)
        },
        onClose: () => {
          closeModal(id)
          resolve(false)
        }
      }
      modals.value.push(modal)
    })
  }

  // Show custom modal
  const showModal = (options = {}) => {
    return new Promise((resolve) => {
      const id = ++modalId
      const modal = {
        id,
        show: true,
        type: 'default',
        ...options,
        onConfirm: (data) => {
          closeModal(id)
          resolve({ confirmed: true, data })
        },
        onCancel: () => {
          closeModal(id)
          resolve({ confirmed: false })
        },
        onClose: () => {
          closeModal(id)
          resolve({ confirmed: false })
        }
      }
      modals.value.push(modal)
    })
  }

  // Close modal
  const closeModal = (id) => {
    const index = modals.value.findIndex(modal => modal.id === id)
    if (index > -1) {
      modals.value.splice(index, 1)
    }
  }

  // Close all modals
  const closeAllModals = () => {
    modals.value = []
  }

  return {
    modals,
    showAlert,
    showConfirm,
    showModal,
    closeModal,
    closeAllModals
  }
}
