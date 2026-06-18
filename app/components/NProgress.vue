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

<style lang="scss">
#nprogress {
  .bar {
    // Brand pink progress bar, offset below the Neubrutalism navbar (61px)
    background-color: #FF5C8A;
    top: 61px;

    .peg {
      display: none;
    }
  }

  .spinner {
    top: 70px;

    .spinner-icon {
      border-top-color: #FF5C8A;
      border-left-color: #FF5C8A;
    }
  }
}
</style>
