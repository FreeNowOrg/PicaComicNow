<template lang="pug">
#index-container
  h1 PicACG

  .info.tips(style='margin-bottom: 1.5rem')
    .title Tips
    p This site is under construction

  .flex.gap-1
    .card.flex-1
      h2 Greeting
      p hello, world
      p {{ time }}
    .card.flex-1
      h2 Profile
      ul
        li
          router-link.button(to='/profile') pforile
        li
          router-link.buggon(to='/favourite') favourite

</template>

<script setup lang="ts">
import { ref } from 'vue'

const time = ref(new Date().toLocaleString())
setInterval(() => {
  time.value = new Date().toLocaleString()
}, 1000)
</script>

<style scoped lang="sass"></style>
