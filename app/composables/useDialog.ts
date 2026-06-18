import { ref, type Component, shallowRef } from 'vue'

export interface DialogOptions {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

const visible = ref(false)
const options = ref<DialogOptions>({})

export function useDialog() {
  function open(opts: DialogOptions) {
    options.value = opts
    visible.value = true
  }

  function close() {
    visible.value = false
    options.value = {}
  }

  function confirm() {
    options.value.onConfirm?.()
    close()
  }

  function cancel() {
    options.value.onCancel?.()
    close()
  }

  return {
    visible,
    options,
    open,
    close,
    confirm,
    cancel,
  }
}
