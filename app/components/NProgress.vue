<template lang="pug">
</template>

<script setup lang="ts">
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

const router = useRouter()

router.beforeEach(() => {
  nprogress.start()
})

router.afterEach(() => {
  nprogress.done()
})
</script>

<style lang="sass">
#nprogress
  .bar
    background-color: var(--theme-secondary-color)
    top: 51px
    .peg
      display: none

  .spinner
    top: 60px

    .spinner-icon
      border-top-color: var(--theme-secondary-color)
      border-left-color: var(--theme-secondary-color)
</style>
