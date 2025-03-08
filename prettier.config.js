// @ts-check
/// <reference types="@prettier/plugin-pug" />

/**
 * @type {import('prettier').Options}
 */
export default {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  quoteProps: 'as-needed',
  endOfLine: 'auto',

  plugins: ['@prettier/plugin-pug'],

  vueIndentScriptAndStyle: false,

  pugSingleQuote: false,
  pugAttributeSeparator: 'as-needed',
  pugSortAttributes: 'asc',
}
