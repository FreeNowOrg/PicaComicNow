<template lang="pug">
span.pica-tag(:class='{ active }', :style='colorStyle')
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: string
  active?: boolean
}>()

const colorStyle = computed(() =>
  props.color ? { backgroundColor: props.color } : undefined
)
</script>

<style scoped lang="scss">
.pica-tag {
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.125rem 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #fff;
  box-shadow: 3px 3px 0 0 #000;
  line-height: 1.4;

  &.active {
    background-color: #FF5C8A;
    color: #fff;
  }
}
</style>
