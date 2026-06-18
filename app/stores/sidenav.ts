import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidenavStore = defineStore('sidenav', () => {
  const isShow = ref<boolean>(false)
  const toggle = (force?: boolean) => {
    isShow.value = typeof force === 'boolean' ? force : !isShow.value
  }
  return { isShow, toggle }
})
