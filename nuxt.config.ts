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
    optimizeDeps: {
      include: [
        '@vicons/fa',
        '@vicons/utils',
        'axios',
        'localforage', // CJS
        'naive-ui',
        'nprogress', // CJS
      ],
    },
  },

  compatibilityDate: '2026-06-18',
})
