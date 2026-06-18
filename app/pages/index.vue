<template lang="pug">
#index-container
  h1 PicACG

  PicaMbox(type='info', header='Tips', style='margin-bottom: 1.5rem')
    p This site is under construction

  .flex.gap-1
    PicaCard.flex-1
      h2 Greeting
      p hello, world
      p {{ time }}
    PicaCard.flex-1
      h2 Profile
      p
        NuxtLink.pica-btn(to='/profile') profile
        | &nbsp;
        NuxtLink.pica-btn(to='/favourite') favourite
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { setTitle } from '~/utils/setTitle'
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

<style scoped lang="scss"></style>
