<template lang="pug">
ul.books-list
  book-card(v-for='item in data', :data='item', :backTo='backTo')
</template>

<script setup lang="ts">
import {} from 'vue'
import type { PicaBookListItem } from '~/types'

defineProps<{ data: PicaBookListItem[]; backTo: string }>()
</script>

<style lang="scss">
ul.books-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
}
</style>
