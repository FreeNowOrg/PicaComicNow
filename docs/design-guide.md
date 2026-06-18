# PicaComicNow 设计指南

## 设计风格：Neubrutalism（新野兽派）

核心视觉特征：粗黑边框、实色偏移阴影、高对比配色、零圆角、粗体排版、按压交互反馈。

---

## 配色

| 令牌 | 色值 | 用途 |
|---|---|---|
| `cream` | `#FFF0F3` | 页面背景（偏粉暖白） |
| `brand-pink` | `#FF5C8A` | 主色，按钮 primary、强调色 |
| `brand-pinkHot` | `#FF6B9D` | 主色 hover 态 |
| `brand-purple` | `#A78BFA` | 辅助强调色（浏览量图标等） |
| `brand-green` | `#7FD957` | 成功、已完结标记 |
| `brand-yellow` | `#FFE066` | 高亮、荧光笔效果、hover 背景 |
| `danger` | `#FF5555` | 错误、危险操作 |
| `bookmark` | `#FF69B4` | 收藏标记 |
| `#000` | — | 边框、阴影、主文字 |
| `#fff` | — | 卡片、输入框背景 |

配色定义在 `uno.config.ts` 的 `theme.colors` 中，通过 UnoCSS 原子类使用（如 `bg-brand-pink`、`text-cream`）。

### 暗色主题预留

页脚等区域的背景色通过 UnoCSS 主题令牌（`footer`、`footer-dark`）定义，未来做暗色主题只需修改 `uno.config.ts` 中的色值。

---

## 排版

| 用途 | 字体族 | 配置键 |
|---|---|---|
| 正文 | Noto Sans SC, PingFang SC, system-ui | `sans` |
| 标题/展示 | Archivo Black, Noto Sans SC, system-ui | `display` |
| 代码/等宽 | Space Grotesk, ui-monospace | `mono` |

### 标题样式

- **h1**：Archivo Black、`2.2rem`、`font-weight: 900`
- **h2**：黄色荧光背景（`#FFE066`）+ 3px 黑色下边框，居中偏移（可在 `.align-center` 内取消偏移）

---

## 边框与阴影

**零圆角** — 全站不使用 `border-radius`，方形棱角是 Neubrutalism 核心视觉特征。

| 级别 | 边框 | 阴影 | 用途 |
|---|---|---|---|
| 标准 | `3px solid #000` | `6px 6px 0 0 #000` | 卡片、轮播、主容器 |
| 小号 | `2px solid #000` | `4px 4px 0 0 #000` | 输入框、标签、面包屑 |
| 大号 | `3px solid #000` | `8px 8px 0 0 #000` | 对话框 |
| 微型 | `2px solid #000` | `3px 3px 0 0 #000` | 小标签、下拉选项 |
| 无阴影 | `2px solid #000` | 无 | 用户卡片等融入背景的元素 |

### 按压效果

hover 时元素向右下偏移、阴影缩为 0，模拟"按下去"的触觉反馈：

```
hover/active: translate(1.5px, 1.5px); box-shadow: 0 0 0 0 #000;
```

---

## UnoCSS Shortcuts

所有 Neubrutalism 相关的原子类组合封装为 `pica-*` 前缀的 shortcuts：

| Shortcut | 用途 |
|---|---|
| `pica-border` | 3px 黑色实线边框 |
| `pica-border-sm` | 2px 黑色实线边框 |
| `pica-shadow` / `sm` / `lg` | 标准/小/大偏移阴影 |
| `pica-card` | 卡片基础样式（边框+阴影+白底+过渡） |
| `pica-btn` | 按钮基础样式（含按压效果） |
| `pica-tag` | 标签样式 |
| `pica-input` | 输入框样式（含 focus 粉色阴影） |
| `pica-press` | 纯按压效果（hover/active 位移+阴影消失） |

---

## 组件体系

### 命名规范

- UI 基础组件：`Pica` 前缀，位于 `app/components/ui/`
- 业务组件：无前缀，位于 `app/components/`
- Nuxt 自动导入，`ui/` 目录通过 `nuxt.config.ts` 配置 `pathPrefix: false`

### 组件清单

| 组件 | 说明 |
|---|---|
| `PicaButton` | 按钮，`variant`（default/primary/danger）、`size`（sm/md/lg） |
| `PicaCard` | 卡片容器，`color`（white/pink/yellow/green/blue） |
| `PicaTag` | 标签，`color`、`active` |
| `PicaMbox` | 消息提示框，`type`（info/success/warning/error）、`header` |
| `PicaDialog` | 模态对话框，通过 `useDialog()` composable 驱动 |
| `PicaToast` | 轻提示，通过 `useToast()` composable 驱动 |
| `PicaSelect` | 下拉选择器，`modelValue`、`options` |
| `PicaPagination` | 分页器，`modelPage`、`pageCount`、`pageSlot` |
| `PicaProvider` | 全局容器，挂载 Dialog + Toast |

---

## 布局

### 页面容器

- `.responsive`：`max-width: 1200px`、`margin: auto`、`padding: 0 2rem`（移动端 1rem）
- 页面背景：`#FFF0F3` + 72×72px 浅色方格线
- Header 高度：63px（60px 内容 + 3px 底边框）

### 响应式断点

| 宽度 | 行为 |
|---|---|
| `≥1080px` | BookCard 网格 5 列 |
| `≥800px` | BookCard 4 列，首页顶部 grid 双栏 |
| `≥600px` | BookCard 3 列 |
| `<600px` | BookCard 2 列，全部单栏堆叠 |

### 面包屑

连续拼接的 pill 段，最后一项黄色背景标记当前位置，hover 变粉色：

```
首页 → 全部漫画 → 分类列表 → 具体分类
```

---

## Pug + UnoCSS 兼容性

Pug 的 `.class` 简写不能包含 `[]`、`:`、`/` 等特殊字符。

| 写法 | 是否安全 |
|---|---|
| `.pica-card`、`.flex`、`.gap-4` | ✅ 安全 |
| `.w-[12px]`、`.hover:bg-red` | ❌ 不安全 |

解决方案：
- 使用 `class='w-[12px]'` 字符串形式
- 使用 attributify：`div(w='[12px]')`
- CSS 变量：`div(bg='[--theme-background-color]')`
- 优先使用 `pica-*` shortcuts 或 `<style scoped>` 避免在模板中写带特殊字符的类

---

## 图标

使用 UnoCSS `preset-icons`，图标集为 Font Awesome 6：
- `@iconify-json/fa6-solid`
- `@iconify-json/fa6-regular`

模板中以 `<i>` 标签 + class 使用：

```pug
i.i-fa6-solid-heart
i.i-fa6-regular-bookmark
```

图标与相邻文字之间需手动加 `margin-right`（全局不会自动添加）。

---

## 交互模式

### 链接

- 默认样式：黑色文字 + 下划线
- hover：`text-decoration: underline`（2px 粗、3px offset）
- 页脚链接 hover：黄色荧光笔背景 + 白色文字（粉色背景）

### 按钮

- 默认背景：cream（`#FFF0F3`）
- hover：按压效果（位移 + 阴影消失）
- disabled：`opacity: 0.5`、无按压效果

### 路由导航

- 列表页初始化加载用 `router.replace`（不产生多余历史记录）
- 用户主动翻页/搜索用 `router.push`（可返回）
- 监听 `route.query` 变化以响应浏览器前进/后退

### 数据缓存

- 首页数据（排行榜、最新上传、随机推荐）存储在 Pinia store（`useHomeStore`），SPA 内导航不重复请求
- 漫画元数据和章节信息通过 `useBookStore` 缓存

---

## 文件组织

```
app/
  components/
    ui/              — Pica* 基础 UI 组件（pathPrefix: false）
    Global*.vue       — 全局布局组件（Header、SideNav、Footer）
    Hero*.vue         — 首页专用组件
    Latest*.vue       — 首页专用组件
    UserCard.vue      — 用户信息卡片
    Book*.vue         — 漫画展示组件
  composables/        — useDialog、useToast
  stores/             — Pinia stores
  pages/              — 路由页面
  assets/styles/
    index.scss        — 入口，引入各模块
    variables.scss    — CSS 自定义属性（仅保留运行时需要的）
    elements.scss     — HTML 元素全局样式
    formats.scss      — 工具类（逐步迁移至 UnoCSS 原子类）
    states.scss       — 状态类
  utils/              — 工具函数、API 客户端
  types/              — TypeScript 类型定义
```

---

## 开发约定

- **模板语言**：Pug（`lang="pug"`）
- **脚本语言**：TypeScript（`lang="ts"`）
- **样式语言**：SCSS（`lang="scss"`），scoped 优先
- **代码注释**：英文
- **UI 文案**：简体中文
- **Commit**：英文，Conventional Commits 格式
- **无第三方 UI 库**：所有 UI 组件自实现
