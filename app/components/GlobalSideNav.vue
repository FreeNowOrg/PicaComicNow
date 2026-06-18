<template lang="pug">
aside.global-site-nav(
  :class='{ "is-hide": !sidenav.isShow }',
  :data-is-show='sidenav.isShow'
)
  .backdrop(@click='sidenav.toggle(false)')
  .inner
    .list
      .group
        .title Navigation
        ul
          li
            NuxtLink(to='/')
              i.i-fa6-solid-house
              | Home
          li
            NuxtLink(to='/categories')
              i.i-fa6-solid-folder
              | Categories Index

      .group
        .title User
        ul
          li(v-if='user.profile')
            NuxtLink(to='/profile')
              i.i-fa6-solid-user
              | {{ user.profile.name }} (you)
          li(v-if='user.profile')
            NuxtLink(to='/favourite')
              i.i-fa6-solid-bookmark
              | My Favourite
          li
            NuxtLink(to='/auth')
              i.i-fa6-solid-fingerprint
              | Authorization

      .group
        .title {{ PROJECT_NAME }}
        ul
          li
            NuxtLink(to='/about')
              i.i-fa6-solid-heart
              | About us
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { PROJECT_NAME } from '~/utils/config'
import { useUserStore } from '~/stores/user'
import { useSidenavStore } from '~/stores/sidenav'

const router = useRouter()
const user = useUserStore()
const sidenav = useSidenavStore()

router.afterEach(() => {
  sidenav.toggle(false)
})

onMounted(() => {
  document.addEventListener('keydown', ({ key }) => {
    if (key === 'Escape') {
      sidenav.toggle(false)
    }
  })
})

watch(
  computed(() => sidenav.isShow),
  (val) => {
    if (val) {
      document.body.classList.add('global-sidenav-is-show', 'lock-scroll')
    } else {
      document.body.classList.remove('global-sidenav-is-show', 'lock-scroll')
    }
  }
)
</script>

<style scoped lang="scss">
.global-site-nav {
  z-index: 15;
}

// Semi-transparent overlay — slightly darker for more presence
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 15;
}

// Side panel: white background, Neubrutalism right border
.inner {
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 60px; // matches updated header height
  width: calc(1rem + 240px);
  max-width: 80vw;
  height: 100vh;
  background-color: #fff;
  border-right: 3px solid #000;
  z-index: 16;
  transition: all 0.5s;
}

.list {
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

.group {
  margin: 0.5rem 0;

  // Section titles: uppercase, spaced, bold — Neubrutalism editorial style
  .title {
    user-select: none;
    padding: 0 1.6rem;
    margin: 1.6rem 0 0.4rem 0;
    font-weight: 900;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #000;
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
  }

  ul {
    margin: 0;
    list-style: none;
    padding-left: 0;

    .xicon {
      margin-right: 0.4rem;
    }

    li {
      a {
        padding: 0.8rem 1.6rem;
        display: block;
        color: #222;
        font-weight: 600;
        transition: background-color 0.1s ease;

        // Neubrutalism: yellow highlight on hover
        &:hover {
          background-color: #FFE066;
          color: #000;
        }

        &::after {
          display: none !important;
        }

        // Active / router-link-active: brand-pink with white text
        &.router-link-active,
        &.router-link-exact-active {
          background-color: #FF5C8A;
          color: #fff;
          font-weight: 700;
        }

        &.not-allowed {
          cursor: not-allowed;
          text-decoration: line-through;
        }
      }
    }
  }
}

// Hidden state — slide panel off-screen, hide backdrop
.is-hide {
  .inner {
    left: -300px;
  }

  .backdrop {
    display: none;
  }
}
</style>
