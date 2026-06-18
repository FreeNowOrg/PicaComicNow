<template lang="pug">
.pica-select(:class='{ open }', ref='selectRef')
  button.pica-select-trigger(@click='open = !open')
    span.pica-select-label {{ currentLabel }}
    span.pica-select-arrow(:class='{ flipped: open }') ▼
  Transition(name='select-dropdown')
    .pica-select-dropdown(v-if='open')
      .pica-select-option(
        v-for='opt in options',
        :key='opt.value',
        :class='{ selected: opt.value === modelValue }',
        @click='select(opt.value)'
      ) {{ opt.label }}
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  options: Array<{ label: string; value: string | number }>
  modelValue: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const open = ref(false)
const selectRef = ref<HTMLElement>()

const currentLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label ?? String(props.modelValue)
})

function select(value: string | number) {
  emit('update:modelValue', value)
  open.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.pica-select {
  position: relative;
  display: inline-block;
  min-width: 7rem;
}

.pica-select-trigger {
  width: 100%;
  border: 2px solid #000;
  border-radius: 0;
  padding: 0.375rem 0.75rem;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 3px 3px 0 0 #000;
  transition: all 150ms;

  &:hover {
    translate: 1px 1px;
    box-shadow: 1px 1px 0 0 #000;
  }
}

.pica-select-arrow {
  font-size: 0.6rem;
  transition: transform 0.2s;
  &.flipped {
    transform: rotate(180deg);
  }
}

.pica-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  border: 2px solid #000;
  border-radius: 0;
  background-color: #fff;
  box-shadow: 4px 4px 0 0 #000;
  z-index: 50;
  overflow: hidden;
}

.pica-select-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background-color: #FFF3C7;
  }

  &.selected {
    background-color: #FF5C8A;
    color: #fff;
    font-weight: 700;
  }
}

// Transitions
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.15s ease;
}
.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
