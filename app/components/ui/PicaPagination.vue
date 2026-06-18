<template lang="pug">
nav.pica-pagination(v-if='pageCount > 1')
  button.page-btn(
    :disabled='modelPage <= 1',
    @click='goTo(modelPage - 1)'
  ) ‹
  template(v-for='item in pageItems', :key='item')
    span.page-ellipsis(v-if='item === "..."') …
    button.page-btn(
      v-else,
      :class='{ active: item === modelPage }',
      @click='goTo(item as number)'
    ) {{ item }}
  button.page-btn(
    :disabled='modelPage >= pageCount',
    @click='goTo(modelPage + 1)'
  ) ›
  .page-jump
    | Go to
    input.jump-input(
      type='number',
      :min='1',
      :max='pageCount',
      :value='modelPage',
      @keydown.enter='handleJump($event)'
    )
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelPage: number
    pageCount: number
    pageSlot?: number
  }>(),
  { pageSlot: 7 }
)

const emit = defineEmits<{
  'update:modelPage': [page: number]
}>()

function goTo(page: number) {
  if (page >= 1 && page <= props.pageCount) {
    emit('update:modelPage', page)
  }
}

function handleJump(e: KeyboardEvent) {
  const value = parseInt((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    goTo(Math.min(Math.max(1, value), props.pageCount))
  }
}

const pageItems = computed(() => {
  const total = props.pageCount
  const current = props.modelPage
  const slot = props.pageSlot
  const items: (number | '...')[] = []

  if (total <= slot) {
    for (let i = 1; i <= total; i++) items.push(i)
    return items
  }

  const half = Math.floor(slot / 2)
  let start = Math.max(2, current - half + 1)
  let end = Math.min(total - 1, current + half - 1)

  if (current <= half) {
    end = slot - 1
  }
  if (current > total - half) {
    start = total - slot + 2
  }

  items.push(1)
  if (start > 2) items.push('...')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('...')
  items.push(total)

  return items
})
</script>

<style scoped lang="scss">
.pica-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.page-btn {
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.25rem 0.625rem;
  background-color: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.875rem;
  min-width: 2rem;
  text-align: center;
  box-shadow: 2px 2px 0 0 #000;
  transition: all 150ms;

  &:hover:not(:disabled):not(.active) {
    translate: 1px 1px;
    box-shadow: 0 0 0 0 #000;
    background-color: #FFF3C7;
  }

  &.active {
    background-color: #FF5C8A;
    color: #fff;
    translate: 2px 2px;
    box-shadow: 0 0 0 0 #000;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.page-ellipsis {
  padding: 0.25rem 0.25rem;
  font-weight: 700;
}

.page-jump {
  margin-left: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.jump-input {
  width: 3.5rem;
  border: 2px solid #000;
  border-radius: 0.375rem;
  padding: 0.25rem 0.375rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.875rem;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #FF5C8A;
    box-shadow: 3px 3px 0 0 #FF5C8A;
  }
}
</style>
