<template lang="pug">
ul.books-list
  book-card(v-for='item in data', :data='item', :backTo='backTo')
</template>

<script setup lang="ts">
import {} from 'vue'
import BookCard from './BookCard.vue'
import type { PicaBookListItem } from '@/types'

defineProps<{ data: PicaBookListItem[]; backTo: string }>()
</script>

<style lang="sass">
ul.books-list
  list-style: none
  padding-left: 0
  display: flex
  gap: 1.5rem
  flex-wrap: wrap
  justify-content: center
</style>
