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
      span LOGO

  .flex-1.flex.nav-links(style='gap: 1rem')
    .item
      router-link(to='/about') About

  .item
    e-link.no-icon(:href='GITHUB_URL')
      icon
        github

global-side-nav
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { GITHUB_URL } from '../config'
import { sideNavShow } from './states'
import { Github, Bars } from '@vicons/fa'
import GlobalSideNav from './GlobalSideNav.vue'

const components = defineComponent({ Github, Bars, GlobalSideNav })
// const props = defineProps()
const notAtTop = ref(document.documentElement.scrollTop > 50)
const isHide = ref(false)

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

watch(notAtTop, () => {
  if (notAtTop.value) {
    document.body.classList.remove('is-at-top')
  } else {
    document.body.classList.add('is-at-top')
  }
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

@media screen and (max-width: 800px)
  .global-header
    .nav-links > .item
      display: none
</style>