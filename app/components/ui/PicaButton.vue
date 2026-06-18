<template lang="pug">
button.pica-button(
  :class='[variantClass, sizeClass]',
  :disabled='disabled',
  @click='$emit("click", $event)'
)
  slot
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    variant: 'default',
    size: 'md',
    disabled: false,
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClass = computed(() => `variant-${props.variant}`)
const sizeClass = computed(() => `size-${props.size}`)
</script>

<style scoped lang="scss">
.pica-button {
  border: 3px solid #000;
  border-radius: 0.5rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 150ms;
  box-shadow: 4px 4px 0 0 #000;
  background-color: #fff;
  color: #000;

  &:hover {
    translate: 1.5px 1.5px;
    box-shadow: 0 0 0 0 #000;
  }

  &:active {
    translate: 3px 3px;
    box-shadow: 0 0 0 0 #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover, &:active {
      translate: 0;
      box-shadow: 4px 4px 0 0 #000;
    }
  }

  // Variants
  &.variant-primary {
    background-color: #FF5C8A;
    color: #fff;
  }

  &.variant-danger {
    background-color: #FF5555;
    color: #fff;
  }

  // Sizes
  &.size-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  &.size-md {
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
  }

  &.size-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  }
}
</style>
