<template lang="pug">
NConfigProvider(
  :locale='zhCN',
  :theme-overrides='theme',
  preflight-style-disabled
)
  NDialogProvider
    NMessageProvider
      slot
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  zhCN,
} from 'naive-ui'

const theme = ref({
  common: {
    primaryColor: 'rgb(239, 118, 163)',
    primaryColorHover: 'rgb(249, 128, 173)',
    primaryColorPressed: 'rgb(229, 108, 153)',
  },
})
</script>

<style scoped lang="sass"></style>
