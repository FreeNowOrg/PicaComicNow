import { Icon } from '@vicons/utils'
import ExternalLink from '~/components/ExternalLink.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Icon', Icon)
  nuxtApp.vueApp.component('ELink', ExternalLink)
})
