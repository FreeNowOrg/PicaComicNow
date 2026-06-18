<template lang="pug">
Transition(name='btt')
  button.back-to-top(v-show='visible', @click='scrollToTop', aria-label='回到顶部')
    i.i-fa6-solid-chevron-up(style='flex-shrink: 0; width: 1em; height: 1em')
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = document.documentElement.scrollTop > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 90;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: #fff;
  color: #000;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 0 #000;
  cursor: pointer;
  transition: all 150ms;

  &:hover {
    translate: 2px 2px;
    box-shadow: 0 0 0 0 #000;
    background: #FFE066;
  }

  &:active {
    background: #FF5C8A;
    color: #fff;
  }
}

@media (max-width: 600px) {
  .back-to-top {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.85rem;
    bottom: 1rem;
    right: 1rem;
    border-width: 2px;
    box-shadow: 3px 3px 0 0 #000;
  }
}

.btt-enter-active,
.btt-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.btt-enter-from,
.btt-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
