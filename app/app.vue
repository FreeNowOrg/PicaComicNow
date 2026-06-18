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
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
}

article {
  margin-top: 63px;
  padding-top: 2rem;
  padding-bottom: 4rem;
}
</style>
