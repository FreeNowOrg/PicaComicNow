<template lang="pug">
footer.global-footer
  .top.flex.responsive
    section.flex-1
      h4 Discovery
      ul
        li
          router-link(to='/about') About us

    section.flex-1
      h4 Follow us
      ul
        li Free Now Organization
          ul
            li
              e-link(href='https://github.com/FreeNowOrg') @FreeNowOrg

    section.flex-1
      h4 Friend links
      p Come to GitHub issues to exchange friend links~

  .bottom.align-center.responsive
    .copyright
      | Copyright &copy; {{ COPYRIGHT_STR }}
      |
      e-link(:href='GITHUB_URL') {{ PROJECT_NAME }}
      |
      em v{{ VERSION }}
</template>

<script setup lang="ts">
import {} from 'vue'
import {
  PROJECT_NAME,
  COPYRIGHT_STR,
  GITHUB_URL,
  GITHUB_OWNER,
  VERSION,
} from '../config'
</script>

<style scoped lang="sass">
.global-footer
  > div
    color: var(--theme-accent-link-color)

  .top
    background-color: var(--theme-accent-color)
    padding-top: 2rem
    padding-bottom: 2rem
    gap: 1.5rem

  .bottom
    padding: 1rem
    background-color: var(--theme-accent-color-darken)

  h4
    position: relative
    margin: 1rem 0 0.5rem 0
    padding-bottom: 0.2rem
    border-bottom: 2px solid
    font-size: 1.1rem

  ul
    padding-left: 1rem
    margin: 0.2rem 0

    a
      display: inline
      font-weight: 400

a
  --color: #eee
  font-weight: 600

@media screen and (max-width: 800px)
  .top
    flex-direction: column
</style>