<template lang="pug">
h1 Categories
pre {{ list }}
.loading(v-if='loading') Loading...
.info.error(v-if='error')
  .title Failed to get categories data
  p {{ error }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'

const list = ref<any[]>([])
const error = ref('')
const loading = ref(false)

function init() {
  loading.value = true
  error.value = ''

  axios
    .get(`${API_BASE}/fetch/categories`)
    .then(
      ({ data }: any) => {
        const { body } = data
        list.value = body.map((item)=>{
          item.thumb
        })
      },
      (err) => {
        error.value =
          err?.response?.data?.message || err.message || 'HTTP Timeout'
      }
    )
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  setTitle('All Categories')
  init()
})
</script>

<style scoped lang="sass"></style>