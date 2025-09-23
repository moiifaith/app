<template>
  <Transition 
    :name="transitionName"
    mode="out-in"
    @before-enter="beforeEnter"
    @enter="enter"
    @leave="leave"
  >
    <slot></slot>
  </Transition>
</template>

<script>
export default {
  name: 'PageTransition',
  props: {
    name: {
      type: String,
      default: 'fade'
    },
    duration: {
      type: Number,
      default: 300
    }
  },
  computed: {
    transitionName() {
      return `page-${this.name}`
    }
  },
  methods: {
    beforeEnter(el) {
      this.$emit('before-enter', el)
    },
    enter(el, done) {
      this.$emit('enter', el)
      // Auto-complete after duration if not manually called
      setTimeout(done, this.duration)
    },
    leave(el, done) {
      this.$emit('leave', el)
      // Auto-complete after duration if not manually called
      setTimeout(done, this.duration)
    }
  }
}
</script>

<style>
/* Fade transition - smooth and subtle */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide transition - directional movement */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Scale transition - zoom effect */
.page-scale-enter-active,
.page-scale-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.page-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Blur transition - focus effect */
.page-blur-enter-active,
.page-blur-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-blur-enter-from,
.page-blur-leave-to {
  opacity: 0;
  filter: blur(5px);
  transform: scale(0.98);
}

/* Flip transition - 3D card effect */
.page-flip-enter-active,
.page-flip-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.page-flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg);
}

.page-flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

/* Bounce transition - playful spring effect */
.page-bounce-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.page-bounce-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-bounce-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.page-bounce-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

/* Elastic transition - rubber band effect */
.page-elastic-enter-active {
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.page-elastic-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-elastic-enter-from {
  opacity: 0;
  transform: scale(0.7) rotate(-5deg);
}

.page-elastic-leave-to {
  opacity: 0;
  transform: scale(1.1) rotate(2deg);
}

/* Gradient transition - color wash effect */
.page-gradient-enter-active,
.page-gradient-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-gradient-enter-from {
  opacity: 0;
  transform: translateY(20px);
  filter: hue-rotate(180deg) saturate(0.5);
}

.page-gradient-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  filter: hue-rotate(-180deg) saturate(0.5);
}
</style>
