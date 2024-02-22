<template lang="pug">
header.global-header.flex-center(
  :class='{ "not-at-top": notAtTop, "is-hide": isHide }'
)
  .item
    a.plain.pointer.side-nav-toggler(
      @click='sideNavShow = !sideNavShow',
      :class='{ "is-active": sideNavShow }'
    )
      icon
        bars

  .item.global-site-logo-container
    router-link.plain.global-site-logo(to='/', title='Home')
      span PicACG

  .flex-1.flex.nav-links(style='gap: 1rem')
    .item
      router-link(to='/categories') Categories
    .item
      router-link(to='/favourite') Favourite
    .item
      router-link(to='/about') About

  .item.search-area
    input.search-input(
      type='text',
      placeholder='Search...',
      v-model='searchInput',
      @keydown.enter='() => (router.push({ name: "search", params: { keyword: searchInput } }), (searchInput = ""))',
      :style='{ height: "2rem" }'
    )

  .item.user-area
    .user-dropdown(@click.stop='')
      a.pointer.plain.dropdown-btn(
        :class='{ "is-show": userDropdownShow }',
        @click='userDropdownShow = !userDropdownShow'
      )
        .avatar
          img(src='https://i.loli.net/2021/03/26/QPOtzh1XbF2eujd.png')
      transition(
        name='fade',
        mode='out-in',
        enter-active-class='fadeInUp',
        leave-active-class='fadeOutDown'
      )
        .dropdown-content(v-show='userDropdownShow')
          ul
            //- notLogIn
            li(v-if='!userData')
              .nav-user-card
                .top
                  .banner-bg
                  img.avatar(
                    src='https://i.loli.net/2021/03/26/QPOtzh1XbF2eujd.png'
                  )
                .details
                  a.user-name Anonymous
                  .uid Please login

            //- isLogedIn
            li(v-if='userData')
              .nav-user-card
                .top
                  .banner-bg
                  router-link.plain.name(to='/profile')
                    img.avatar(
                      src='https://i.loli.net/2021/03/26/QPOtzh1XbF2eujd.png'
                    )
                .details
                  router-link.plain.user-name(to='/profile') {{ userData.name }}
                  .uid {{ userData.email }}
            li(v-if='userData')
              router-link.plain(to='/favourite') My Favourites

            li(v-if='$route.path !== "/auth"')
              router-link.plain(to='/auth') {{ userData ? 'Logout' : 'Login' }}

global-side-nav
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { GITHUB_URL } from '../config'
import { sideNavShow } from './states'
import { userData } from './userData'
import { Github, Bars, UserCircle, AngleDown } from '@vicons/fa'
import GlobalSideNav from './GlobalSideNav.vue'
import { useRouter } from 'vue-router'

const components = defineComponent({ Github, Bars, GlobalSideNav })
// const props = defineProps()
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

<style scoped lang="sass">
.global-header
  height: 50px
  width: 100%
  padding: 0 1rem
  position: fixed
  gap: 1rem
  font-size: 1.25rem
  z-index: 100
  background-color: #fff
  transition: box-shadow 0.4s ease
  box-shadow: 0 1px 0 #eee

  a
    --color: #222

  // &.not-at-top
  //   box-shadow: 0 0 12px #eee

  .side-nav-toggler
    --color: #888
    display: inline-block
    width: 40px
    height: 40px
    line-height: 45px
    text-align: center
    border-radius: 50%

    &:hover,
    &.is-active
      background-color: rgba(0, 0, 0, 0.05)

  .global-site-logo
    .desc
      font-size: 0.6rem
      font-weight: 600
      color: #222
      text-align: right

    img
      display: block
      height: 1.8rem
      width: auto

  .user-area
    .avatar
      font-size: 1.6rem
    .avatar img,
    img.avatar
      border-radius: 50%

    .user-dropdown
      font-size: 1rem
      position: relative
      .dropdown-btn
        position: relative
        display: inline-flex
        align-items: center
        .avatar
          margin-right: 0.2rem
          img
            width: 2rem
            height: 2rem
            box-shadow: 0 0 0 2px #fff
            vertical-align: middle
        .angle svg
          transition: all 0.12s ease
        &:hover
          .avatar
            img
              box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25)
        &.is-show
          .avatar
            img
              box-shadow: 0 0 0 2px var(--theme-accent-color)
          .angle svg
            transform: rotateZ(180deg)

      .dropdown-content
        position: absolute
        top: 1.8rem
        right: 0
        padding: 0
        padding-top: 0.4rem
        width: 200px

        ul
          list-style: none
          padding: 4px
          background-color: #fff
          box-shadow: 0 0 4px #aaa
          border-radius: 4px

          li > *
            padding: 0.5rem

          li a
            display: block
            cursor: pointer
            --color: var(--theme-link-color)

            &:hover
              background-color: var(--theme-tag-color)

  .nav-user-card
    border-bottom: 1px solid
    position: relative

    .banner-bg
      position: absolute
      top: -4px
      left: -4px
      height: 3rem
      width: calc(100% + 8px)
      background-color: rgba(var(--theme-accent-color--rgb), 0.1)
      z-index: 0

    a
      display: inline !important

    .avatar
      width: 68px
      height: 68px
      box-shadow: 0 0 0 4px #fff
      z-index: 1

    .details
      .user-name
        font-size: 1rem

      .uid
        font-size: 0.8rem
        color: #aaa

@media  (max-width: 800px)
  .global-header
    .nav-links > .item
      display: none

// Animate
.fadeInUp
  animation: fadeInUp 0.24s ease

.fadeOutDown
  animation: fadeOutDown 0.4s ease

@keyframes fadeInUp
  0%
    opacity: 0
    transform: translate3d(0, 1rem, 0)

  to
    opacity: 1
    transform: translateZ(0)

@keyframes fadeOutDown
  0%
    opacity: 1

  to
    opacity: 0
    transform: translate3d(0, 1rem, 0)
</style>
