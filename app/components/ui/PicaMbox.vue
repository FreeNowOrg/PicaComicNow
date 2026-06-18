<template lang="pug">
div.pica-mbox(:class='[type || "default"]')
  .pica-mbox-title(v-if='header || $slots.header')
    slot(name='header')
      | {{ header }}
  .pica-mbox-content
    slot
      p(v-if='content') {{ content }}
</template>

<script setup lang="ts">
defineProps<{
  type?: 'info' | 'error' | 'warning' | 'success' | 'default'
  header?: string
  content?: string
}>()
</script>

<style scoped lang="scss">
.pica-mbox {
  border: 3px solid #000;
  border-left: 6px solid #000;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 4px 4px 0 0 #000;
  background-color: #fff;

  .pica-mbox-title {
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.5rem 1rem;
    background-color: rgba(0, 0, 0, 0.05);
    border-bottom: 2px solid #000;
  }

  .pica-mbox-content {
    padding: 1rem;

    > :first-child {
      margin-top: 0;
    }
    > :last-child {
      margin-bottom: 0;
    }
  }

  &.info {
    border-left-color: #3B82F6;
    .pica-mbox-title {
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
  &.success {
    border-left-color: #7FD957;
    .pica-mbox-title {
      background-color: rgba(127, 217, 87, 0.1);
    }
  }
  &.warning {
    border-left-color: #FFE066;
    .pica-mbox-title {
      background-color: rgba(255, 224, 102, 0.15);
    }
  }
  &.error {
    border-left-color: #FF5555;
    .pica-mbox-title {
      background-color: rgba(255, 85, 85, 0.1);
    }
  }
}
</style>
