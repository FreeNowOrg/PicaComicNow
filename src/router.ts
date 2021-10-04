import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [],
  scrollBehavior(to, from) {
    if (to === from) return
    return { top: 0 }
  },
})

// Home
router.addRoute({
  path: '/',
  name: 'index',
  component: () => import('./view/index.vue'),
})

// About
router.addRoute({
  path: '/about',
  name: 'about',
  component: () => import('./view/about.vue'),
})

// 404
router.addRoute({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('./view/404.vue'),
})

router.afterEach(({ name }) => {
  document.body.setAttribute('data-route', name as string)
  // Fix route when modal opened
  document.body.classList.remove('lock-scroll')
})
