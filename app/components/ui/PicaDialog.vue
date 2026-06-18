<template lang="pug">
Teleport(to='body')
  Transition(name='dialog')
    .pica-dialog-overlay(v-if='dialog.visible.value', @click.self='dialog.cancel()')
      .pica-dialog
        .pica-dialog-header(v-if='dialog.options.value.title')
          h3 {{ dialog.options.value.title }}
        .pica-dialog-body(v-if='dialog.options.value.content')
          p {{ dialog.options.value.content }}
        .pica-dialog-footer
          PicaButton(
            @click='dialog.cancel()',
            size='sm'
          ) {{ dialog.options.value.cancelText || 'Cancel' }}
          PicaButton(
            variant='primary',
            @click='dialog.confirm()',
            size='sm'
          ) {{ dialog.options.value.confirmText || 'OK' }}
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useDialog } from '~/composables/useDialog'

const dialog = useDialog()

watch(dialog.visible, (val) => {
  if (val) {
    document.body.classList.add('lock-scroll')
  } else {
    document.body.classList.remove('lock-scroll')
  }
})
</script>

<style scoped lang="scss">
.pica-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
}

.pica-dialog {
  border: 3px solid #000;
  border-radius: 0;
  box-shadow: 8px 8px 0 0 #000;
  background-color: #fff;
  min-width: 320px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: auto;
}

.pica-dialog-header {
  padding: 1rem 1.25rem 0;
  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 900;
  }
}

.pica-dialog-body {
  padding: 1rem 1.25rem;
  p {
    margin: 0;
  }
}

.pica-dialog-footer {
  padding: 0 1.25rem 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

// Transitions
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
