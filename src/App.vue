<template lang="pug">
naiveui-provider#app-container
  main.flex-1
    article.responsive
      router-view

  n-progress
  global-header
  global-side-nav
  global-footer
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalHeader from './components/GlobalHeader.vue'
import GlobalSideNav from './components/GlobalSideNav.vue'
import GlobalFooter from './components/GlobalFooter.vue'
import NProgress from './components/NProgress.vue'
import { useRoute, useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { useUserStore } from './stores/user'
import NaiveuiProvider from './components/NaiveuiProvider.vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

onMounted(async () => {
  if (!user.profile) {
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
