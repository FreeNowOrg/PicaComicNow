<template lang="pug">
#app-container
  n-progress
  global-header

  main.flex-1
    article.responsive
      router-view

  global-footer
</template>

<script setup lang="ts">
import { defineComponent, onMounted } from 'vue'
import GlobalHeader from './components/GobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import NProgress from './components/NProgress.vue'
import { getProfile, userData } from './components/userData'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const components = defineComponent({
  GlobalHeader,
  GlobalFooter,
  NProgress,
})

onMounted(async () => {
  if (!userData.value) {
    getProfile().catch((err) => {
      console.warn('[App]', 'Verification information has expired', err)
      if (route.name !== 'auth') {
        router.push({
          name: 'auth',
          query: {
            from: route.path,
            tips: 1,
          },
        })
      }
    })
  }
})
</script>

<style scoped lang="sass">
#app-container
  display: flex
  flex-direction: column
  min-height: 100vh

main
  background-color: var(--theme-background-color)

article
  margin-top: 50px
  padding-top: 2rem
  padding-bottom: 4rem
</style>