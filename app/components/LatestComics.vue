<template lang="pug">
.latest-comics
  .latest-header
    h3 最新上传
  .latest-list
    NuxtLink.latest-item(
      v-for='comic in comics',
      :key='comic._id',
      :to='"/book/" + comic._id'
    )
      .latest-thumb
        Lazyload(:src='comic.thumb.fileUrl')
      .latest-info
        .latest-title {{ comic.title }}
        .latest-author @{{ comic.author }}
  .latest-footer
    NuxtLink(to='/comics?s=dd') 更多新作 →
</template>

<script setup lang="ts">
import type { PicaBookListItem } from '~/types'

defineProps<{ comics: PicaBookListItem[] }>()
</script>

<style scoped lang="scss">
.latest-comics {
  border: 3px solid #000;
  box-shadow: 6px 6px 0 0 #000;
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 360px;
}

.latest-header {
  padding: 0.75rem 1rem;
  border-bottom: 3px solid #000;
  background: #FFE066;

  h3 {
    margin: 0;
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 900;
  }
}

.latest-list {
  flex: 1;
  overflow-y: auto;
}

.latest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: inherit;
  border-bottom: 1px solid #eee;
  transition: background 0.1s;

  &:hover {
    background: #FFF0F3;
    text-decoration: none;
  }

  &:last-child {
    border-bottom: none;
  }
}

.latest-thumb {
  width: 40px;
  height: 53px;
  flex-shrink: 0;
  border: 2px solid #000;
  overflow: hidden;

  :deep(.lazyload) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.latest-info {
  flex: 1;
  min-width: 0;
}

.latest-title {
  font-weight: 700;
  font-size: 0.85rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.latest-author {
  font-size: 0.75rem;
  color: #888;
  font-weight: 600;
}

.latest-footer {
  padding: 0.5rem 1rem;
  border-top: 2px solid #000;
  text-align: right;

  a {
    font-size: 0.8rem;
    font-weight: 700;
    color: #FF5C8A;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
