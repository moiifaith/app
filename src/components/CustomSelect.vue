<template>
  <div class="custom-select" :class="{ active: isOpen }" ref="selectRef">
    <div class="select-trigger" @click="toggleDropdown">
      <span class="selected-option">
        {{ getLanguageLabel(modelValue) }}
      </span>
      <svg class="select-arrow" :class="{ rotated: isOpen }" viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </div>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option.value)"
          class="select-option"
          :class="{ selected: modelValue === option.value }"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'CustomSelect',
  props: {
    modelValue: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const selectRef = ref(null)

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    const selectOption = (value) => {
      console.log('CustomSelect: selecting option', value)
      emit('update:modelValue', value)
      isOpen.value = false
    }

    const getLanguageLabel = (value) => {
      const option = props.options.find(opt => opt.value === value)
      return option ? option.label : value
    }

    const handleClickOutside = (event) => {
      if (selectRef.value && !selectRef.value.contains(event.target)) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isOpen,
      selectRef,
      toggleDropdown,
      selectOption,
      getLanguageLabel
    }
  }
}
</script>

<style scoped>
.custom-select {
  position: relative;
  min-width: 150px;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  min-height: 36px;
}

.select-trigger:hover {
  background: rgba(255, 255, 255, 0.3);
}

.custom-select.active .select-trigger {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.selected-option {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  width: 20px;
  height: 20px;
  fill: currentColor;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.select-option {
  padding: 12px 16px;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.select-option.selected {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 600;
}

.select-option.selected:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Dark theme for app pages */
.app-theme .select-trigger {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.app-theme .select-trigger:hover,
.app-theme .custom-select.active .select-trigger {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Landing page theme */
.landing-theme .select-trigger {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.1);
  color: #2c3e50;
}

.landing-theme .select-trigger:hover,
.landing-theme .custom-select.active .select-trigger {
  background: white;
  border-color: rgba(102, 126, 234, 0.3);
}
</style>
