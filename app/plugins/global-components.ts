import ExternalLink from '~/components/ExternalLink.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ELink', ExternalLink)
})
