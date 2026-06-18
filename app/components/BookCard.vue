<template lang="pug">
li.book-card.card
  NuxtLink.thumb-link(
    :to='{ name: "book", params: { bookid: data._id }, query: { backTo } }'
  )
    .thumb
      lazyload.img(:src='data.thumb.fileUrl', :key='data._id')
  .desc
    NuxtLink(
      :to='{ name: "book", params: { bookid: data._id }, query: { backTo } }'
    )
      .title
        .pages(v-if='data.pagesCount') [{{ data.epsCount > 1 ? data.epsCount + 'EP/' : '' }}{{ data.pagesCount }}P]
        .name {{ data.title }}
    .author
      NuxtLink(:to='{ path: "/search", query: { keyword: data.author } }') @{{ data.author }}
    .tags-list
      NuxtLink.tag(
        v-for='item in data.categories',
        :data-tag='item',
        :to='{ name: "comics", params: { category: item } }'
      ) {{ item }}
    .stats
      .likes
        i.i-fa6-solid-heart
        | {{ data.likesCount }}
      .views
        i.i-fa6-solid-eye
        | {{ data.totalViews }}
</template>

<script setup lang="ts">
import type { PicaBookListItem } from '~/types'

defineProps<{ data: PicaBookListItem; backTo: string }>()
</script>

<style lang="scss">
li.book-card {
  max-width: 240px;
  width: calc(50% - 2rem);
  position: relative;
  padding: 0;

  // Neubrutalism card: thick border + solid shadow
  border: 3px solid #000;
  border-radius: 0;
  box-shadow: 6px 6px 0 0 #000;
  background: #fff;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translate(3px, 3px);
    box-shadow: 3px 3px 0 0 #000;
  }

  .thumb-link {
    display: block;
    width: 100%;
    border-bottom: 3px solid #000;

    .thumb {
      position: relative;

      .lazyload {
        display: block;
        top: 0;
        left: 0;
        width: 100%;
        height: auto;
      }
    }
  }

  .desc {
    padding: 0.6rem 0.75rem 0.75rem;

    .title {
      font-weight: 900;
      font-size: 0.9rem;
      line-height: 1.3;
      margin-bottom: 0.25rem;

      > * {
        display: inline;
        margin-right: 0.4rem;
      }

      // Episode/page count badge
      .pages {
        font-family: "Space Grotesk", ui-monospace, monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: #FF5C8A;
        white-space: nowrap;
      }
    }

    .author {
      font-size: 0.8rem;
      font-weight: 700;
      color: #666;
      margin-bottom: 0.4rem;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 0.5rem;

      // Neubrutalism tag: small solid border + offset shadow
      .tag {
        display: inline-flex;
        align-items: center;
        padding: 1px 6px;
        font-size: 0.7rem;
        font-weight: 700;
        border: 2px solid #000;
        border-radius: 0;
        box-shadow: 2px 2px 0 0 #000;
        background: #fff;
        color: #000;
        text-decoration: none;
        transition: transform 0.1s ease, box-shadow 0.1s ease;

        &:hover {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 0 #000;
          background: #FFE066;
        }
      }
    }

    .stats {
      display: flex;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 700;

      .likes {
        color: #FF5C8A;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }

      .views {
        color: #A78BFA;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
    }
  }
}
</style>
