import { defineConfig, presetWind4, presetAttributify, presetIcons } from 'unocss'
import extractorPug from '@unocss/extractor-pug'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: false,
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  extractors: [extractorPug()],
  theme: {
    colors: {
      cream: '#FFF0F3',
      brand: {
        pink: '#FF5C8A',
        pinkHot: '#FF6B9D',
        purple: '#A78BFA',
        green: '#7FD957',
        yellow: '#FFE066',
      },
      footer: {
        DEFAULT: '#ffffff',
        dark: '#ffffff',
      },
      danger: '#FF5555',
      link: '#3F51B5',
      bookmark: '#FF69B4',
    },
    fontFamily: {
      sans: '"Noto Sans SC", "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif',
      display: '"Archivo Black", "Noto Sans SC", system-ui, sans-serif',
      mono: '"Space Grotesk", ui-monospace, monospace',
    },
    animation: {
      'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
      'fade-in': 'fadeIn 0.6s ease-out forwards',
      'bounce-in': 'bounceIn 0.8s ease-out forwards',
    },
    keyframes: {
      fadeInUp: {
        '0%': { opacity: '0', transform: 'translateY(50px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeInDown: {
        '0%': { opacity: '0', transform: 'translateY(-50px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      bounceIn: {
        '0%': { opacity: '0', transform: 'scale(0.3) translateY(50px)' },
        '50%': { opacity: '0.8', transform: 'scale(1.05) translateY(-10px)' },
        '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
      },
    },
  },
  shortcuts: {
    'pica-border': 'border-3 border-solid border-black',
    'pica-border-sm': 'border-2 border-solid border-black',
    'pica-shadow': 'shadow-[6px_6px_0_0_#000]',
    'pica-shadow-sm': 'shadow-[4px_4px_0_0_#000]',
    'pica-shadow-lg': 'shadow-[8px_8px_0_0_#000]',
    'pica-card': 'pica-border pica-shadow bg-white transition-all duration-150',
    'pica-press':
      'hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[0_0_0_0_#000] active:translate-x-1.5 active:translate-y-1.5 active:shadow-[0_0_0_0_#000]',
    'pica-btn':
      'pica-border pica-shadow px-6 py-3 font-black inline-flex items-center gap-2 bg-cream text-black no-underline transition-all duration-150 hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[0_0_0_0_#000] hover:no-underline active:translate-x-1.5 active:translate-y-1.5 active:shadow-[0_0_0_0_#000]',
    'pica-tag':
      'pica-border-sm shadow-[3px_3px_0_0_#000] px-3 py-1 font-bold text-sm inline-flex items-center gap-1 bg-white',
    'pica-input':
      'w-full pica-border-sm px-4 py-3 bg-white text-black font-medium focus:outline-0 focus:border-brand-pink focus:shadow-[4px_4px_0_0_#FF5C8A] transition-all duration-150',
  },
  safelist: [
    'bg-brand-pink',
    'bg-brand-pinkHot',
    'bg-brand-purple',
    'bg-brand-green',
    'bg-brand-yellow',
    'bg-cream',
  ],
})
