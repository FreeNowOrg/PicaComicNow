import { createRouter, createWebHistory } from 'vue-router'
import { getProfile, userData } from './components/userData'

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

// Categories
router.addRoute({
  path: '/categories',
  name: 'categories',
  component: () => import('./view/categories.vue'),
})

// Comics
router.addRoute({
  path: '/comics',
  name: 'comics-index',
  component: () => import('./view/comics.vue'),
})
router.addRoute({
  path: '/comics/:category',
  name: 'comics',
  component: () => import('./view/comics.vue'),
})

// Auth
router.addRoute({
  path: '/auth',
  name: 'auth',
  component: () => import('./view/auth.vue'),
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

router.beforeEach(async ({ name }, { path: fromPath }) => {
  if (!userData.value && name !== 'auth') {
    await getProfile().catch(() => {
      console.warn('[App]', 'Verification information has expired')
      router.push({
        name: 'auth',
        query: { from: fromPath, tips: 'You must log in to use this website' },
      })
    })
  }
})

router.afterEach(({ name }) => {
  document.body.setAttribute('data-route', name as string)
  // Fix route when modal opened
  document.body.classList.remove('lock-scroll')
})
