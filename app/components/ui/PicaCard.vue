<template lang="pug">
div.pica-card(:class='[colorClass]')
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    color?: 'white' | 'pink' | 'yellow' | 'green' | 'blue'
  }>(),
  { color: 'white' }
)

const colorClass = computed(() => `color-${props.color}`)
</script>

<style scoped lang="scss">
.pica-card {
  border: 3px solid #000;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 6px 6px 0 0 #000;
  transition: all 150ms;
  background-color: #fff;

  &.color-pink {
    background-color: #FFD6E0;
  }
  &.color-yellow {
    background-color: #FFF3C7;
  }
  &.color-green {
    background-color: #D4EDDA;
  }
  &.color-blue {
    background-color: #D6E4FF;
  }
}
</style>
