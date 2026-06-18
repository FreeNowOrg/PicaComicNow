<template lang="pug">
Teleport(to='body')
  .pica-toast-container
    TransitionGroup(name='toast')
      .pica-toast(
        v-for='toast in toasts.toasts.value',
        :key='toast.id',
        :class='toast.type',
        @click='toasts.remove(toast.id)'
      )
        span {{ toast.message }}
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const toasts = useToast()
</script>

<style scoped lang="scss">
.pica-toast-container {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  pointer-events: none;
}

.pica-toast {
  border: 2px solid #000;
  border-radius: 0.5rem;
  padding: 0.75rem 1.25rem;
  box-shadow: 4px 4px 0 0 #000;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  max-width: 90vw;
  overflow: hidden;
  text-overflow: ellipsis;

  &.info {
    background-color: #D6E4FF;
  }
  &.success {
    background-color: #D4EDDA;
  }
  &.warning {
    background-color: #FFF3C7;
  }
  &.error {
    background-color: #FFD6D6;
  }
}

// Transitions
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}
</style>
