<template lang="pug">
.hero-carousel(
  @mouseenter='pause',
  @mouseleave='resume'
)
  .slides
    NuxtLink.slide(
      v-for='(comic, i) in comics',
      :key='comic._id',
      :class='{ active: i === current }',
      :to='"/book/" + comic._id'
    )
      Lazyload.slide-bg(:src='comic.thumb.fileUrl')
      .slide-overlay
      .slide-content
        .rank \#{{ i + 1 }}
        .slide-title {{ comic.title }}
        .slide-meta
          span.author @{{ comic.author }}
          span.views
            i.i-fa6-solid-eye
            | {{ formatCount(comic.viewsCount || comic.totalViews) }}
  .controls
    button.arrow.prev(@click='prev')
      i.i-fa6-solid-chevron-left
    .dots
      button.dot(
        v-for='(_, i) in comics',
        :key='i',
        :class='{ active: i === current }',
        @click='goTo(i)'
      )
    button.arrow.next(@click='next')
      i.i-fa6-solid-chevron-right
  .ranking-link
    NuxtLink(to='/leaderboard') 查看完整排行榜 →
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { PicaLeaderboardItem } from '~/types'

defineProps<{ comics: PicaLeaderboardItem[] }>()

const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function next() {
  current.value = (current.value + 1) % 5
}

function prev() {
  current.value = (current.value - 1 + 5) % 5
}

function goTo(i: number) {
  current.value = i
}

function startTimer() {
  timer = setInterval(next, 5000)
}

function pause() {
  if (timer) { clearInterval(timer); timer = null }
}

function resume() {
  if (!timer) startTimer()
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

onMounted(startTimer)
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped lang="scss">
.hero-carousel {
  border: 3px solid #000;
  box-shadow: 6px 6px 0 0 #000;
  position: relative;
  overflow: hidden;
  height: 360px;
  background: #000;
}

.slides {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s ease;
  display: flex;
  align-items: flex-end;
  text-decoration: none;
  color: #fff;

  &.active {
    opacity: 1;
    z-index: 1;
  }
}

.slide-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.slide-content {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  width: 100%;

  .rank {
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
    color: #FFE066;
    text-shadow: 3px 3px 0 #000;
  }

  .slide-title {
    font-size: 1.25rem;
    font-weight: 900;
    margin: 0.25rem 0;
    text-shadow: 1px 1px 0 #000;
  }

  .slide-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    opacity: 0.9;

    .views {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
}

.arrow {
  background: none;
  border: 2px solid #fff;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
  box-shadow: none;
  transition: background 0.15s;

  &:hover {
    background: #FF5C8A;
    border-color: #FF5C8A;
    translate: 0;
    box-shadow: none;
  }
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
  background: transparent;
  padding: 0;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.15s;

  &.active {
    background: #FF5C8A;
    border-color: #FF5C8A;
  }

  &:hover {
    background: #fff;
    translate: 0;
    box-shadow: none;
  }
}

.ranking-link {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  z-index: 3;
  font-size: 0.8rem;
  font-weight: 700;

  a {
    color: #FFE066;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
