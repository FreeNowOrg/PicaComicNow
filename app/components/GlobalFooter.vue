<template lang="pug">
footer.global-footer
  .top.bg-footer
    .footer-inner.footer-grid
      section.site-intro
        h4 {{ PROJECT_NAME }}
        p This is a fan made website. We are NOT PicACG official.
        p 这是一个粉丝向网站，我们与 PicACG 官方<u>没有任何关系</u>。
        p <u>请勿</u>在任何地方传播本网站——珍惜眼前。

      section
        h4 快速导航
        ul
          li
            NuxtLink(to='/') 首页
          li
            NuxtLink(to='/categories') 分类
          li
            NuxtLink(to='/favourite') 收藏夹
          li
            NuxtLink(to='/about') 关于

      section
        h4 友情链接
        ul
          li
            e-link(href='https://github.com/FreeNowOrg') @FreeNowOrg

  .bottom.bg-footer-dark
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

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 2rem;
  }

  .top {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .bottom {
    padding-top: 1rem;
    padding-bottom: 1rem;
    color: #555;
    border-top: 2px solid #000;
  }

  .site-intro {
    p {
      font-size: 0.85rem;
      line-height: 1.6;
      margin: 0.25rem 0;
    }
  }

  h4 {
    display: inline-block;
    margin: 0 0 0.75rem 0;
    padding: 0.1em 0.5em;
    font-size: 1.1rem;
    font-family: "Archivo Black", "Noto Sans SC", system-ui, sans-serif;
    font-weight: 900;
    color: #000;
    background-color: #FFE066;
    border-bottom: 3px solid #000;
  }

  ul {
    padding-left: 0;
    list-style: none;
    margin: 0.75rem 0 0;

    li {
      margin-bottom: 0.25rem;
    }

    a {
      display: inline;
      font-weight: 600;
    }
  }
}

a {
  --color: #000;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background-color: #FF5C8A;
    color: #fff;
  }
}

@media (max-width: 800px) {
  .global-footer .footer-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
