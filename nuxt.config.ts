export default defineNuxtConfig({
  ssr: false,

  modules: ['@pinia/nuxt'],

  css: ['~/assets/styles/index.sass'],

  runtimeConfig: {
    picaS3Base: '',
    picaProxyHost: '',
    picaProxyPort: '',
  },

  vite: {
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console'] : [],
    },
  },

  compatibilityDate: '2025-05-01',
})
