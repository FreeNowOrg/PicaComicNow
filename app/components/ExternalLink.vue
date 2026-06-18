<template lang="pug">
a.external-link(:href='href', target='_blank', rel='nofollow')
  slot
  i.i-fa6-solid-up-right-from-square.external-icon
</template>

<script setup lang="ts">
const props = defineProps<{
  href: string
}>()
</script>

<style scoped lang="scss">
.external-icon {
  font-size: 0.75em;
  margin-left: 4px;
}

.no-icon {
  .external-icon {
    display: none;
  }
}
</style>
