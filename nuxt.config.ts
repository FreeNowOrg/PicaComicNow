export default defineNuxtConfig({
  ssr: false,

  modules: ['@unocss/nuxt', '@pinia/nuxt'],

  css: ['~/assets/styles/index.scss'],

  runtimeConfig: {
    picaS3Base: '',
  },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
    optimizeDeps: {
      include: [
        'axios',
        'localforage',
        'nprogress',
      ],
    },
  },

  compatibilityDate: '2026-06-18',
})
