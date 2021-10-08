<template lang="pug">
li.book-card.card
  router-link.thumb-link(
    :to='{ name: "book", params: { bookid: data._id }, query: { backTo } }'
  )
    .thumb
      lazyload.img(:src='data.thumb.fileUrl')
  .desc
    router-link(
      :to='{ name: "book", params: { bookid: data._id }, query: { backTo } }'
    )
      .title
        .pages [{{ data.epsCount > 1 ? data.epsCount + "EP/" : "" }}{{ data.pagesCount }}P]
        .name {{ data.title }}
    .author
      router-link(:to='"/search/" + data.author') @{{ data.author }}
    .tags-list
      router-link.tag(
        v-for='item in data.categories',
        :data-tag='item',
        :to='{ name: "comics", params: { category: item } }'
      ) {{ item }}
    .stats
      .likes 
        icon
          Heart
        | {{ data.likesCount }}
      .views
        icon
          Eye
        | {{ data.totalViews }}
  details
    pre {{ data }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { CheckCircle, PenNib, ThumbsUp, Heart, Eye } from '@vicons/fa'

const props = defineProps<{ data: any; backTo: string }>()
</script>

<style lang="sass">
li.book-card
  // flex: 1
  max-width: 240px
  width: calc(50% - 2rem)
  position: relative

  .thumb-link
    width: 100%
    .thumb
      position: relative
      .img
        display: block
        top: 0
        left: 0
        width: 100%
        height: auto
  .desc
    .title
      > *
        display: inline
        margin-right: 0.4rem

    .stats
      > div
        display: inline-block
        margin-right: 0.5rem
</style>