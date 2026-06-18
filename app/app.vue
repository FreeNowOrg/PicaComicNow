<template lang="pug">
PicaProvider#app-container
  main.flex-1
    article.responsive
      NuxtPage

  NProgress
  GlobalHeader
  GlobalSideNav
  GlobalFooter
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  background-color: #FFF0F3;
}

article {
  margin-top: 60px;
  padding-top: 2rem;
  padding-bottom: 4rem;
}
</style>
