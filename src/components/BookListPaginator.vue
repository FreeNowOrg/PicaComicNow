<template lang="pug">
.book-list-paginator
  .sort-selector
    n-select(
      :options='PICA_LIST_SORT_OPTIONS',
      :value='sort',
      @update:value='emit("update:sort", $event)',
      size='small'
    )
  .page-selector
    n-pagination(
      :page='page',
      :page-count='totalPages',
      show-quick-jumper,
      :page-slot='7',
      @update:page='emit("update:page", $event)'
    )
</template>

<script setup lang="ts">
import { PicaListSort, PICA_LIST_SORT_OPTIONS } from '@/types'
import { NPagination, NSelect } from 'naive-ui'
import { effect } from 'vue'
const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    sort?: PicaListSort
  }>(),
  {
    page: 1,
    totalPages: 1,
    sort: PicaListSort.DEFAULT,
  }
)
const emit = defineEmits<{
  'update:page': [number]
  'update:sort': [PicaListSort]
}>()

effect(() => {
  if (!props.page || isNaN(props.page) || props.page < 1) {
    console.warn('Invalid page value', props.page)
    emit('update:page', 1)
  } else if (props.page > props.totalPages) {
    console.warn('Page value exceeds total pages', props.page, props.totalPages)
    emit('update:page', props.totalPages)
  }
})
effect(() => {
  if (!Object.values(PicaListSort).includes(props.sort)) {
    console.warn('Invalid sort value', props.sort, PicaListSort)
    emit('update:sort', PicaListSort.DEFAULT)
  }
})
</script>

<style scoped lang="sass">
.book-list-paginator
  display: flex
  gap: 1rem
  justify-content: center
  flex-wrap: wrap
  .sort-selector
    min-width: 7rem
</style>
