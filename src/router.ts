import {
  createRouter,
  createWebHistory,
  type NavigationGuard,
} from 'vue-router'
import { useUserStore } from './stores/user'

export const router = createRouter({
  history: createWebHistory(),
  routes: [],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0,
        behavior: 'smooth',
      }
    }
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

// Book
router.addRoute({
  path: '/book/:bookid',
  name: 'book',
  component: () => import('./view/book.vue'),
})

// Read
router.addRoute({
  path: '/book/:bookid/:epsid',
  alias: ['/read/:bookid/:epsid'],
  name: 'read',
  component: () => import('./view/read.vue'),
})

// User
router.addRoute({
  path: '/auth',
  name: 'auth',
  component: () => import('./view/auth.vue'),
})
router.addRoute({
  path: '/profile',
  name: 'profile',
  component: () => import('./view/profile.vue'),
})
router.addRoute({
  path: '/favourite',
  name: 'favourite',
  alias: ['/bookmark', '/bookmarks', '/favorite', '/favourites'],
  component: () => import('./view/favourite.vue'),
})

// Search
router.addRoute({
  path: '/search/:keyword?',
  name: 'search',
  component: () => import('./view/search.vue'),
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

const userAuthGuard: NavigationGuard = async ({ name, fullPath }) => {
  const user = useUserStore()
  if (!user.isLoggedIn && name !== 'auth') {
    await user.fetchProfile().catch(() => {
      console.warn('[App]', 'Verification information has expired')
      router.push({
        name: 'auth',
        query: { from: fullPath, tips: 1 },
      })
    })
  }
}
router.beforeEach(userAuthGuard)
router.afterEach(userAuthGuard as any)

router.afterEach(({ name }) => {
  document.body.setAttribute('data-route', name as string)
  // Fix route when modal opened
  document.body.classList.remove('lock-scroll')
})
