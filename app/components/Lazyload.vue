<template lang="pug">
component.lazyload(
  :is='loaded ? "img" : "svg"',
  :width='width',
  :height='height',
  :src='src',
  :data-lazy-state='loaded ? "loaded" : error ? "failed" : "loading"',
  role='img',
  ref='imgRef'
)
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
const props = defineProps<{
  src: string
  width?: number
  height?: number
}>()
const loaded = ref(false)
const error = ref(false)
const imgRef = ref<HTMLImageElement>()
function init() {
  const img = new Image()
  img.src = props.src
  img.onload = () => {
    loaded.value = true
    error.value = false
  }
  img.onerror = () => {
    loaded.value = false
    error.value = true
  }
}
let observer: IntersectionObserver
onMounted(async () => {
  await nextTick()
  const img = imgRef.value
  if (!img) return
  observer = new IntersectionObserver((entries) => {
    const [entry] = entries
    if (entry.isIntersecting) {
      init()
      observer.disconnect()
    }
  })
  observer.observe(img)
})
onBeforeUnmount(() => {
  observer && observer.disconnect()
})
</script>

<style scoped lang="sass">
.lazyload
  &[data-lazy-state="pending"]
    background-color: #e8e8e8
  &[data-lazy-state="loading"],
  &[data-lazy-state="retry"]
    animation: img-loading 0.6s ease infinite alternate
    border: 0
  &[data-lazy-state="failed"]
    background: #fff url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAGElEQVQYV2N4DwX/oYBhgARgDJjEAAkAAEC99wFuu0VFAAAAAElFTkSuQmCC) repeat

@keyframes img-loading
  from
    background-color: lighten(#ddd, 5%)
  to
    background-color: #ddd
</style>
