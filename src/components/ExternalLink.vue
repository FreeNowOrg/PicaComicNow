<template lang="pug">
a.external-link(:href='href', target='_blank', rel='nofollow')
  slot
  icon.external-icon
    ExternalLinkAlt
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { ExternalLinkAlt } from '@vicons/fa'

// const components = defineComponent()

const props =
  defineProps<{
    href: string
  }>()
</script>

<style scoped lang="sass">
.external-icon
  font-size: 0.75em
  margin-left: 4px

.no-icon
  .external-icon
    display: none
</style>