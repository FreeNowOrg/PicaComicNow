<template lang="pug">
ul.books-list
  book-card(v-for='item in data', :data='item', :category='category')
</template>

<script setup lang="ts">
import { defineComponent, defineProps } from 'vue'
// import { Comic } from '../types'
import BookCard from './BookCard.vue'

const components = defineComponent({ BookCard })
const props = defineProps<{ data: any[]; category: string }>()
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