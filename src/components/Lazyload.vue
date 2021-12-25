<template lang="pug">
component(
  :is='loaded ? "img" : "svg"',
  :width='width',
  :height='height',
  :src='src',
  :class='{ lazyload: true, isLoading: !loaded && !error, isLoaded: loaded, isError: error }',
  role='img'
)
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // eslint-disable-next-line vue/require-prop-types
  props: ['src', 'width', 'height', 'class'],
  data() {
    return {
      loaded: false,
      error: false,
    }
  },
  watch: {
    src() {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loaded = false
      this.error = false
      const img = new Image()
      img.src = this.src
      img.onload = () => {
        this.loaded = true
      }
      img.onerror = () => {
        this.error = true
      }
    },
  },
})
</script>

<style scoped lang="sass">
.isLoading
  animation: imgProgress 0.6s ease infinite alternate

@keyframes imgProgress
  from
    background-color: lighten(#e8e8e8, 4%)
  to
    background-color: #e8e8e8
</style>
