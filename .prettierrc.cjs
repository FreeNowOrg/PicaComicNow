module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  quoteProps: 'as-needed',
  endOfLine: 'auto',
  /**
   * @author 小鱼君 2022年4月3日
   * @desc 目前 prettier 的插件寻址机制与 pnpm 的依赖组织形式不兼容
   *       官方对于此问题摆烂了，所以我们必须手动指定插件的位置
   * @link https://github.com/prettier/prettier/issues/8056#issuecomment-1003587768
   */
  plugins: [require.resolve('@prettier/plugin-pug')],
}
