<template lang="pug">
.eps-list
  NuxtLink.ep-link(
    v-for='item in eps',
    :key='item._id',
    :to='getLink(item)'
  ) {{ item.title }}
</template>

<script setup lang="ts">
import type { PicaBookEp } from '~/types'

const props = defineProps<{
  eps: PicaBookEp[]
  bookId: string
  extraQuery?: Record<string, string>
}>()

function getLink(item: PicaBookEp) {
  const base = `/book/${props.bookId}/${item.order}`
  if (!props.extraQuery) return base
  const qs = new URLSearchParams(props.extraQuery).toString()
  return qs ? `${base}?${qs}` : base
}
</script>

<style scoped lang="scss">
.eps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .ep-link {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border: 2px solid #000;
    box-shadow: 3px 3px 0 0 #000;
    background-color: #fff;
    font-weight: 700;
    font-size: 0.875rem;
    color: #000;
    transition: all 150ms;
    text-decoration: none;

    &:hover {
      translate: 1.5px 1.5px;
      box-shadow: 0 0 0 0 #000;
      background-color: #FFF0F3;
    }

    &.router-link-active {
      background-color: #FF5C8A;
      color: #fff;
    }
  }
}
</style>
