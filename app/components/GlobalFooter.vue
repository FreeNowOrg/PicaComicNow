<template lang="pug">
footer.global-footer
  .top
    .footer-inner.flex
      section.flex-1
        h4 Discovery
        ul
          li
            NuxtLink(to='/about') About us
          li
            NuxtLink(to='/categories') Categories
            ul
              li
                NuxtLink(to='/comics/妹妹系') 妹妹系
              li
                NuxtLink(to='/search/獸耳') 兽耳娘，我现在就要看兽耳娘

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

  .top
    .footer-inner
      section
        h4 Attention please
        p This is a fan made website. We are NOT PicACG official. Please DO NOT share this website anywhere.
        p 这是一个粉丝向网站，我们与 PicACG 官方<u>没有任何关系</u>。<u>请勿</u>在任何地方传播本网站——珍惜眼前。

  .bottom
    .footer-inner.align-center
      .copyright
        | Copyright &copy; {{ COPYRIGHT_STR }}
        |
        e-link(:href='GITHUB_URL') {{ PROJECT_NAME }}
        |
        em v{{ VERSION }}
        | &nbsp;|&nbsp;
        span For communication and learning only.
</template>

<script setup lang="ts">
import {
  PROJECT_NAME,
  COPYRIGHT_STR,
  GITHUB_URL,
  VERSION,
} from '~/utils/config'
</script>

<style scoped lang="scss">
.global-footer {
  border-top: 3px solid #000;

  > div {
    color: #333;
  }

  .footer-inner {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .top {
    background-color: #f5e4e8;
    padding-top: 2rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid #000;

    .flex {
      gap: 1.5rem;
    }
  }

  .bottom {
    padding-top: 1rem;
    padding-bottom: 1rem;
    background-color: #e8ced4;
    color: #555;
  }

  h4 {
    position: relative;
    margin: 1rem 0 0.5rem 0;
    padding-bottom: 0.4rem;
    border-bottom: 2px solid #000;
    font-size: 1.1rem;
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-weight: 900;
    color: #000;
  }

  ul {
    padding-left: 1rem;
    margin: 0.2rem 0;

    a {
      display: inline;
      font-weight: 400;
    }
  }
}

a {
  --color: #3F51B5;
  font-weight: 600;
}

@media (max-width: 800px) {
  .global-footer .top .flex {
    flex-direction: column;
  }
}
</style>
