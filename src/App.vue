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
import { onMounted } from 'vue'
import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import NProgress from './components/NProgress.vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { useUserStore } from './stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

onMounted(async () => {
  if (!user.data) {
    user.fetchProfile().catch((err) => {
      console.warn('[App]', 'Verification information has expired', err)
      if (route.name !== 'auth') {
        router.push({
          name: 'auth',
          query: {
            from: location.pathname,
            tips: 1,
          },
        })
      }
    })
  }
  window.Cookies = Cookies
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
