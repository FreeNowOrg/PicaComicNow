<template lang="pug">
#error-404
  h1 404 Not Found
  p This page has been lost
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setTitle } from '../utils/setTitle'
onMounted(() => {
  setTitle('404', 'Error')
})
</script>

<style scoped lang="sass"></style>