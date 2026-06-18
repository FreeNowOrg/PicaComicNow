<template lang="pug">
#book-container
  section.book-info
    .bread-crumb
      NuxtLink(to='/') 首页
      NuxtLink(to='/comics') 全部漫画
      span(v-if='bookMeta') {{ bookMeta.title }}
    .loading.align-center(v-if='isLoadingMeta || !bookMeta')
      placeholder
    PicaCard(v-if='bookMeta')
      .details
        .left
          e-link.no-icon.thumb(:href='bookMeta.thumb.fileUrl')
            lazyload.img.pica-border(
              :src='bookMeta.thumb.fileUrl',
              :width='200',
              :height='266'
            )
        .right
          .title-area
            h1.title {{ bookMeta.title }}
            a.bookmark(
              :class='bookMeta.isFavourite ? "is-favourite" : "not-favourite"',
              :title='bookMeta.isFavourite ? "取消收藏" : "添加收藏"',
              @click='handleBookmark'
            )
              i.i-fa6-solid-bookmark(v-if='bookMeta.isFavourite')
              i.i-fa6-regular-bookmark(v-else)
          .meta-fields
            .finished
              i.i-fa6-solid-circle-check.text-brand-green(v-if='bookMeta.finished')
              i.i-fa6-solid-pen-nib.text-brand-pink(v-else)
              |
              | {{ bookMeta.finished ? '已完结' : '连载中' }}
            .pages
              strong 页数：
              | {{ bookMeta.pagesCount }} 页，{{ bookMeta.epsCount }} 章节
            .author
              strong 作者：
              NuxtLink(:to='"/search?keyword=" + bookMeta.author') @{{ bookMeta.author }}
            .chinese-team(v-if='bookMeta.chineseTeam')
              strong 汉化组：
              NuxtLink(:to='"/search?keyword=" + bookMeta.chineseTeam') {{ bookMeta.chineseTeam }}
            .tags-list
              strong 分类：
              NuxtLink.tag(
                v-for='item in bookMeta.categories',
                :to='"/comics/" + item'
              ) {{ item }}
            .stats
              .stat-item.views
                i.i-fa6-solid-eye.text-brand-purple
                span {{ bookMeta.viewsCount }}
              .stat-item.likes
                i.i-fa6-solid-heart.text-brand-pink
                span {{ bookMeta.likesCount }}
              .stat-item.comments
                i.i-fa6-solid-comment.text-brand-yellow
                span {{ bookMeta.commentsCount }}

      .tags-list
        strong 标签：
        NuxtLink.tag(v-for='item in bookMeta.tags', :to='"/search?keyword=" + item') {{ item }}

      .description {{ bookMeta.description }}

  section.book-eps
    PicaCard
      h2#eps 章节列表
      p.loading.align-center(v-if='isLoadingEps || !bookEps.length')
        placeholder
      EpsList(v-if='bookEps.length', :eps='bookEps', :book-id='bookid', :extra-query='epsLinkQuery')

  section.extra-actions
    PicaCard
      h2 其他操作
      details
        summary 漫画元数据
        pre {{ bookMeta }}
      details
        summary 章节数据
        pre {{ bookEps }}
      p(v-if='bookMeta')
        PicaButton(variant='danger', @click='init(true)') 强制重新加载
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getErrMsg } from '~/utils/getErrMsg'
import { setTitle } from '~/utils/setTitle'
import type { PicaBookMeta, PicaBookEp } from '~/types'
import { useBookStore } from '~/stores/book'

definePageMeta({ name: 'book' })

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const epsLinkQuery = computed(() => {
  const backTo = route.query.backTo as string | undefined
  return backTo ? { backTo } : undefined
})
const bookStore = useBookStore()
const bookMeta = ref<PicaBookMeta>()
const bookEps = ref<PicaBookEp[]>([])
const isLoadingMeta = ref(false)
const isLoadingEps = ref(false)
const errorTitle = ref('')
const errorMsg = ref('')

async function init(noCache = false) {
  bookMeta.value = undefined
  bookEps.value = []
  errorMsg.value = ''

  loadBookMeta(noCache)
  loadBookEps(noCache)
}

async function loadBookMeta(noCache = false) {
  isLoadingMeta.value = true
  return bookStore
    .getBookMeta(bookid.value, noCache)
    .then((meta) => {
      bookMeta.value = meta
      setTitle(meta.title, 'Book')
      return bookMeta.value
    })
    .catch((err: any) => {
      errorTitle.value = 'Failed to get book info'
      errorMsg.value = getErrMsg(err)
    })
    .finally(() => {
      isLoadingMeta.value = false
    })
}

async function loadBookEps(noCache = false): Promise<PicaBookEp[]> {
  isLoadingEps.value = true
  return bookStore
    .getBookEps(bookid.value, noCache)
    .then((list) => {
      bookEps.value = list
      return list
    })
    .catch((err: any) => {
      errorTitle.value = 'Failed to get book episodes'
      errorMsg.value = getErrMsg(err)
      return Promise.reject(err)
    })
    .finally(() => {
      isLoadingEps.value = false
    })
}

let bookmarkLoading = false
function handleBookmark() {
  if (bookmarkLoading || !bookMeta.value) return
  bookmarkLoading = true
  bookStore
    .toggleBookmark(bookid.value)
    .then(
      (added) => {
        bookMeta.value!.isFavourite = added
      },
      (err) => {
        console.warn('Faild to set favourite status')
      }
    )
    .finally(() => {
      bookmarkLoading = false
    })
}

watch(bookid, () => {
  init()
})

onMounted(() => {
  setTitle('Book')
  init()
})
</script>

<style lang="scss">
#book-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-info {
  .details {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .left {
    width: 200px;
    flex-shrink: 0;

    .thumb {
      .img {
        width: 100%;
        height: auto;
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .title-area {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title {
    margin: 0 0 1rem 0;
    font-family: 'Archivo Black', 'Noto Sans SC', system-ui, sans-serif;
    font-size: 1.6rem;
    flex: 1;
  }

  .bookmark {
    font-size: 1.6rem;
    cursor: pointer;
    transition: all 150ms;
    display: inline-block;

    &.is-favourite {
      color: #FF69B4;
    }

    &.not-favourite {
      color: #aaa;
    }

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(0.9);
    }
  }

  .meta-fields {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.5rem;

    > div {
      flex: 1;
    }
  }

  .stats {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 700;

      i {
        font-size: 1.1rem;
      }
    }
  }

  .description {
    margin-top: 1rem;
    white-space: pre-wrap;
    line-height: 1.6;
  }
}

// Tags: Neubrutalism styling
.tags-list {
  .tag {
    border: 2px solid #000;
    border-radius: 0;
    box-shadow: 2px 2px 0 0 #000;
    padding: 0.125rem 0.5rem;
    font-weight: 700;
    font-size: 0.875rem;
    background-color: #fff;
    color: #000;
    transition: all 150ms;

    &:hover {
      background-color: #FFE066;
    }

    &.router-link-active {
      background-color: #FF5C8A;
      color: #fff;
    }

    &[data-tag="生肉"] {
      background-color: #dd8221;
      color: #fff;
    }
  }
}

@media (max-width: 600px) {
  .book-info {
    .details {
      flex-direction: column;

      .left {
        width: 100%;
        text-align: center;

        .lazyload {
          width: 320px;
          max-width: 100%;
          height: auto;
        }
      }
    }
  }
}
</style>
