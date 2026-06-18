<template lang="pug">
#error-404
  .error-content
    .error-code 404
    h1.error-title Not Found
    p.error-message This page has been lost in the void.
    NuxtLink.pica-btn(to='/') Go Home
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setTitle } from '~/utils/setTitle'

definePageMeta({ name: 'not-found' })

onMounted(() => {
  setTitle('404', 'Error')
})
</script>

<style scoped lang="scss">
#error-404 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.error-content {
  .error-code {
    font-size: 8rem;
    font-weight: 900;
    line-height: 1;
    color: #ff5c8a;
    text-shadow: 4px 4px 0 #000;
    margin-bottom: 0.5rem;
  }

  .error-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0.5rem 0;
  }

  .error-message {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 2rem;
  }
}
</style>
