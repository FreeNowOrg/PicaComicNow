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
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 600px) {
  ul.books-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 800px) {
  ul.books-list {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1080px) {
  ul.books-list {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
