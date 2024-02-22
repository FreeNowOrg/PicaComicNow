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
      p
        router-link.button(to='/profile') profile
        | 
        router-link.button(to='/favourite') favourite

</template>

<script setup lang="ts">
import { setTitle } from '@/utils/setTitle';
import { ref } from 'vue'

setTitle()

const time = ref(new Date().toLocaleString())
setInterval(() => {
  time.value = new Date().toLocaleString()
}, 1000)
</script>

<style scoped lang="sass"></style>
