// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['*.d.ts', '**/dist', '*.dev.*'],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      globals: globals.browser,
    },
  },
  configPrettier
)
