<template lang="pug">
.mbox(:class='[type || "default"]')
  .mbox-title(v-if='header || $slots.header')
    slot(name='header')
      | {{ header }}
  .mbox-content
    slot
      p(v-if='content') {{ content }}
</template>

<script setup lang="ts">
defineProps<{
  type: 'info' | 'error' | 'warning' | 'success' | 'default'
  header?: string
  content?: string
}>()
</script>

<style scoped lang="sass">
.mbox
  --border-color: rgba(0, 0, 0, 0.1)
  --bg-color: rgba(0, 0, 0, 0.04)
  background-color: #fff
  border: 1px solid var(--bg-color)
  border-left: 0.5rem solid var(--border-color)
  border-radius: 0.5rem
  overflow: hidden
  .mbox-content
    padding: 1rem
    margin: 0
  .mbox-title
    font-weight: 600
    font-size: 1.2rem
    padding: 0.4rem 1rem
    background-color: var(--bg-color)
  &.info
    --border-color: #30a0ff
    --bg-color: rgba(0, 140, 255, 0.1)
  &.success
    --border-color: #00a000
    --bg-color: rgba(0, 160, 0, 0.1)
  &.warning
    --border-color: #ffa500
    --bg-color: rgba(231, 139, 0, 0.1)
  &.error
    --border-color: #e00000
    --bg-color: rgba(233, 0, 0, 0.1)
</style>
