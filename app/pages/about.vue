<template lang="pug">
#about-container
  h1 关于我们

  h2 关于本站
  PicaCard
    p Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    p Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    p Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    p Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setTitle } from '~/utils/setTitle'

onMounted(() => {
  setTitle('About')
})
</script>

<style scoped lang="scss"></style>
