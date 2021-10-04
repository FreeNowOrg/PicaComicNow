<template lang="pug">
li.book-card.card
  router-link(:to='"/book/" + data.id')
    .thumb
      lazyload.img(:src='data.thumb.fileUrl')
  .desc
    router-link(:to='"/book/" + data.id')
      .title
        .pages [{{ data.epsCount > 1 ? data.epsCount + "EP/" : "" }}{{ data.pagesCount }}P]
        icon
          check-circle(v-if='data.finished')
          pen-nib(v-else)
        .name {{ data.title }}
    .author @{{ data.author }}
    .tags-list
      a.pointer.tag(v-for='item in data.categories') {{ item }}
    .stats
      .likes likes {{ data.likesCount }}
      .views views {{ data.totalViews }}
  details
    pre {{ data }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { CheckCircle, PenNib, ThumbsUp } from '@vicons/fa'

const props = defineProps<{ data: any }>()
</script>

<style lang="sass">
li.book-card
  flex: 1
  min-width: 240px
  max-width: 240px
  position: relative

  .thumb
    position: relative
    .img
      display: block
      max-width: 100%
  .desc
    .title
      > *
        display: inline
        margin-right: 0.4rem
    .tags-list
      line-height: 1.6
      .tag
        line-height: 1em
        display: inline-block
        padding: 2px 4px
        margin-right: 0.4rem
        background-color: aliceblue

    .stats
      > div
        display: inline-block
        margin-right: 0.5rem
</style>