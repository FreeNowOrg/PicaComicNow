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
      min-height: 270px
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