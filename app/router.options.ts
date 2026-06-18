import type { RouterConfig } from 'nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
}
