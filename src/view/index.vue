<template lang="pug">
#index-container
  h1 PicACG

  .mbox.info(style='margin-bottom: 1.5rem')
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
        | &nbsp;
        router-link.button(to='/favourite') favourite
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { setTitle } from '@/utils/setTitle'
import { onBeforeUnmount, ref } from 'vue'

setTitle()

const user = useUserStore()

const time = ref(new Date().toLocaleString())
let timer = setInterval(() => {
  time.value = new Date().toLocaleString()
}, 1000)
onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped lang="sass"></style>
