<template lang="pug">
header.global-header.flex-center(
  :class='{ "not-at-top": notAtTop, "is-hide": isHide }'
)
  .item
    a.plain.pointer.side-nav-toggler(
      @click='sidenav.toggle()',
      :class='{ "is-active": sidenav.isShow }'
    )
      i.i-fa6-solid-bars

  .item.global-site-logo-container
    NuxtLink.plain.global-site-logo(to='/', title='Home')
      span PicACG

  .flex-1.flex.nav-links(style='gap: 1rem')
    .item
      NuxtLink(to='/categories') Categories
    .item
      NuxtLink(to='/favourite') Favourite
    .item
      NuxtLink(to='/about') About

  .item.search-area
    input.search-input(
      type='text',
      placeholder='Search...',
      v-model='searchInput',
      @keydown.enter='() => (router.push({ path: "/search", query: { keyword: searchInput } }), (searchInput = ""))',
      :style='{ height: "2rem" }'
    )

  .item.user-area
    .user-dropdown(@click.stop='')
      a.pointer.plain.dropdown-btn(
        :class='{ "is-show": userDropdownShow }',
        @click='userDropdownShow = !userDropdownShow'
      )
        .avatar
          img(src='https://r2.epb.wiki/avatar.jpg')
      transition(
        name='fade',
        mode='out-in',
        enter-active-class='fadeInUp',
        leave-active-class='fadeOutDown'
      )
        .dropdown-content(v-show='userDropdownShow')
          ul
            //- notLogIn
            li(v-if='!user.profile')
              .nav-user-card
                .top
                  .banner-bg
                  img.avatar(src='https://r2.epb.wiki/avatar.jpg')
                .details
                  a.user-name Anonymous
                  .uid Please login

            //- isLogedIn
            li(v-if='user.profile')
              .nav-user-card
                .top
                  .banner-bg
                  NuxtLink.plain.name(to='/profile')
                    img.avatar(
                      :src='user.profile.avatar.fileUrl',
                      alt='',
                      style='background-color: #ddd'
                    )
                .details
                  NuxtLink.plain.user-name(to='/profile') {{ user.profile.name }}
                  .uid {{ user.profile.email }}
            li(v-if='user.profile')
              NuxtLink.plain(to='/favourite') My Favourites

            li(v-if='$route.path !== "/auth"')
              NuxtLink.plain(to='/auth') {{ user.profile ? 'Logout' : 'Login' }}
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useSidenavStore } from '~/stores/sidenav'

const user = useUserStore()
const sidenav = useSidenavStore()

const notAtTop = ref(document.documentElement.scrollTop > 50)
const isHide = ref(false)
const userDropdownShow = ref(false)
const router = useRouter()

onMounted(() => {
  let oldTop = document.documentElement.scrollTop
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop
    if (scrollTop > 50) {
      notAtTop.value = true
    } else {
      notAtTop.value = false
    }
    if (oldTop < scrollTop && notAtTop.value) {
      isHide.value = true
    } else {
      isHide.value = false
    }
    oldTop = scrollTop
  })
})

router.afterEach(() => {
  userDropdownShow.value = false
})

const searchInput = ref('')

watch(notAtTop, () => {
  if (notAtTop.value) {
    document.body.classList.remove('is-at-top')
  } else {
    document.body.classList.add('is-at-top')
  }
})

onMounted(() => {
  document.body.addEventListener('click', () => {
    userDropdownShow.value = false
  })
})
</script>

<style scoped lang="scss">
.global-header {
  height: 60px;
  width: 100%;
  padding: 0 1rem;
  position: fixed;
  gap: 1rem;
  font-size: 1.25rem;
  z-index: 100;
  background-color: #fff;
  // Neubrutalism: thick bottom border instead of box-shadow
  border-bottom: 3px solid #000;
  transition: transform 0.3s ease;

  a {
    --color: #222;
  }

  // Navigation links: bold weight for Neubrutalism feel
  .nav-links {
    .item a {
      font-weight: 700;
      letter-spacing: 0.01em;
    }
  }

  .side-nav-toggler {
    --color: #222;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 0;

    &:hover,
    &.is-active {
      background-color: #FFE066;
    }
  }

  .global-site-logo {
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-weight: 900;
    font-size: 1.3rem;
    letter-spacing: -0.02em;

    .desc {
      font-size: 0.6rem;
      font-weight: 600;
      color: #222;
      text-align: right;
    }

    img {
      display: block;
      height: 1.8rem;
      width: auto;
    }
  }

  // Search input: pica-input style inline
  .search-input {
    border: 2px solid #000;
    border-radius: 0;
    padding: 0 0.75rem;
    background-color: #fff;
    font-weight: 500;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: #FF5C8A;
      box-shadow: 4px 4px 0 0 #FF5C8A;
    }
  }

  .user-area {
    display: flex;
    align-items: center;

    .avatar img,
    img.avatar {
      border-radius: 0;
      display: block;
    }

    .user-dropdown {
      font-size: 1rem;
      position: relative;

      .dropdown-btn {
        position: relative;
        display: inline-flex;
        align-items: center;

        .avatar {
          margin-right: 0.2rem;

          img {
            width: 2rem;
            height: 2rem;
            // Neubrutalism: solid offset ring instead of blurred shadow
            box-shadow: 2px 2px 0 0 #000;
            vertical-align: middle;
          }
        }

        .angle svg {
          transition: all 0.12s ease;
        }

        &:hover {
          .avatar img {
            box-shadow: 3px 3px 0 0 #FF5C8A;
          }
        }

        &.is-show {
          .avatar img {
            box-shadow: 3px 3px 0 0 #FF5C8A;
          }

          .angle svg {
            transform: rotateZ(180deg);
          }
        }
      }

      // Dropdown panel: pica-card style
      .dropdown-content {
        position: absolute;
        top: 2rem;
        right: 0;
        padding: 0;
        padding-top: 0.4rem;
        width: 200px;

        ul {
          list-style: none;
          padding: 4px;
          background-color: #fff;
          border: 3px solid #000;
          box-shadow: 6px 6px 0 0 #000;
          border-radius: 0;

          li > * {
            padding: 0.5rem;
          }

          li a {
            display: block;
            cursor: pointer;
            font-weight: 600;
            --color: #222;

            &:hover {
              background-color: #FFE066; // brand-yellow hover
            }
          }
        }
      }
    }
  }

  .nav-user-card {
    border-bottom: 2px solid #000;
    position: relative;

    .banner-bg {
      position: absolute;
      top: -4px;
      left: -4px;
      height: 3rem;
      width: calc(100% + 8px);
      background-color: rgba(255, 92, 138, 0.1); // brand-pink tint
      z-index: 0;
    }

    a {
      display: inline !important;
    }

    .avatar {
      width: 68px;
      height: 68px;
      box-shadow: 3px 3px 0 0 #000;
      z-index: 1;
    }

    .details {
      .user-name {
        font-size: 1rem;
        font-weight: 700;
      }

      .uid {
        font-size: 0.8rem;
        color: #666;
      }
    }
  }
}

// Hide nav links on narrow screens
@media (max-width: 800px) {
  .global-header {
    .nav-links > .item {
      display: none;
    }
  }
}

// Animate — dropdown entry/exit
.fadeInUp {
  animation: fadeInUp 0.24s ease;
}

.fadeOutDown {
  animation: fadeOutDown 0.4s ease;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translate3d(0, 1rem, 0);
  }

  to {
    opacity: 1;
    transform: translateZ(0);
  }
}

@keyframes fadeOutDown {
  0% {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: translate3d(0, 1rem, 0);
  }
}
</style>
