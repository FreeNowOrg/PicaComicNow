# PicaComic (哔咔) API 文档

> 基于 PicaComicNow 项目逆向整理，API 基地址：`https://picaapi.picacomic.com/`

## 认证

所有接口（除登录外）需要在请求头携带 `authorization` 字段，值为登录后获取的 JWT token。

请求签名使用 HMAC-SHA256，涉及以下参数：
- API Key: `C69BAF41DA5ABD1FFEDC6D2FEA56B`
- Signature Key: `~d}$Q7$eIni=V)9\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn`
- App Version: `2.2.1.2.3.3`
- Platform: `android`

---

## 通用数据结构

### Thumb（缩略图）

```json
{
  "originalName": "cover.jpg",
  "path": "xxx.jpg",
  "fileServer": "https://s3.picacomic.com",
  "fileUrl": "https://s3.picacomic.com/static/xxx.jpg"
}
```

### ComicListItem（漫画列表项）

出现在搜索结果、分类列表、收藏夹、随机推荐、排行榜等列表接口中。

```json
{
  "_id": "5821862b5f6b9a4f93dc56eb",
  "title": "漫画标题",
  "author": "作者名",
  "totalViews": 100000,
  "totalLikes": 5000,
  "pagesCount": 144,
  "epsCount": 3,
  "finished": true,
  "categories": ["分类A", "分类B"],
  "tags": ["标签1", "标签2"],
  "thumb": { /* Thumb */ },
  "likesCount": 5000
}
```

排行榜接口额外包含：
- `leaderboardCount`: 排行榜计数值
- `viewsCount`: 浏览量计数

### Pagination（分页）

```json
{
  "docs": [ /* ComicListItem[] */ ],
  "total": 139298,
  "limit": 20,
  "page": 1,
  "pages": 6965
}
```

---

## 用户相关

### 登录

```
POST /auth/sign-in
```

**请求体：**
```json
{
  "email": "用户名或邮箱",
  "password": "密码"
}
```

**响应：**
```json
{
  "token": "JWT token"
}
```

### 获取用户资料

```
GET /users/profile
```

**响应字段：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | string | 用户 ID |
| `email` | string | 用户名/邮箱 |
| `name` | string | 昵称 |
| `birthday` | string | 生日（ISO 8601） |
| `gender` | string | 性别：`m` / `f` / `bot` |
| `slogan` | string | 个性签名 |
| `title` | string | 头衔（如"萌新"） |
| `verified` | boolean | 是否验证 |
| `exp` | number | 经验值 |
| `level` | number | 等级 |
| `characters` | string[] | 头衔装饰 |
| `created_at` | string | 注册时间 |
| `avatar` | Thumb | 头像 |
| `isPunched` | boolean | 今日是否打卡 |

### 更新个性签名

```
PUT /users/profile
```

**请求体：**
```json
{
  "slogan": "新的签名"
}
```

### 修改密码

```
PUT /users/password
```

**请求体：**
```json
{
  "old_password": "旧密码",
  "new_password": "新密码"
}
```

---

## 漫画浏览

### 分类列表

```
GET /categories
```

**响应：**`categories` 数组，每项：

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | string | 分类名称 |
| `thumb` | Thumb | 分类封面 |
| `isWeb` | boolean | 是否为外部网页链接 |
| `active` | boolean | 是否启用 |
| `link` | string | 外部链接（`isWeb=true` 时） |

### 按分类浏览漫画

```
GET /comics?c={category}&page={page}&s={sort}
```

**参数：**

| 参数 | 说明 |
|---|---|
| `c` | 分类名称（可选，不传则返回全部） |
| `page` | 页码，从 1 开始 |
| `s` | 排序方式 |

**排序方式 `s` 的可选值：**

| 值 | 说明 |
|---|---|
| `ua` | 默认 |
| `dd` | 最新发布 |
| `da` | 最早发布 |
| `ld` | 最多喜欢 |
| `vd` | 最多浏览 |

**响应：**`comics` 为 Pagination 结构，`docs` 为 ComicListItem 数组。

### 漫画详情

```
GET /comics/{bookId}
```

**响应字段（`comic` 对象）：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | string | 漫画 ID |
| `_creator` | object | 上传者信息 |
| `title` | string | 标题 |
| `description` | string | 简介 |
| `thumb` | Thumb | 封面 |
| `author` | string | 作者 |
| `chineseTeam` | string | 汉化组 |
| `categories` | string[] | 分类 |
| `tags` | string[] | 标签 |
| `pagesCount` | number | 总页数 |
| `epsCount` | number | 总章节数 |
| `finished` | boolean | 是否完结 |
| `updated_at` | string | 更新时间 |
| `created_at` | string | 创建时间 |
| `allowDownload` | boolean | 是否允许下载 |
| `allowComment` | boolean | 是否允许评论 |
| `totalLikes` | number | 总喜欢数 |
| `totalViews` | number | 总浏览数 |
| `totalComments` | number | 总评论数 |
| `viewsCount` | number | 浏览计数 |
| `likesCount` | number | 喜欢计数 |
| `commentsCount` | number | 评论计数 |
| `isFavourite` | boolean | 当前用户是否收藏 |
| `isLiked` | boolean | 当前用户是否喜欢 |

### 漫画章节列表

```
GET /comics/{bookId}/eps?page={page}
```

**响应：**`eps` 为 Pagination 结构，`docs` 每项：

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | string | 章节 ID |
| `title` | string | 章节标题 |
| `order` | number | 章节序号 |
| `updated_at` | string | 更新时间 |

### 漫画页面内容

```
GET /comics/{bookId}/order/{epsOrder}/pages?page={page}
```

**参数：**
- `epsOrder`: 章节序号（非 ID）
- `page`: 分页页码

**响应：**分页结构，`docs` 每项包含 `media`（Thumb 结构）字段。

### 切换收藏

```
POST /comics/{bookId}/favourite
```

**响应：**`action` 字段为 `favourite`（已收藏）或 `un_favourite`（取消收藏）。

---

## 搜索

### 高级搜索

```
POST /comics/advanced-search
```

**请求体：**
```json
{
  "keyword": "搜索关键词",
  "categories": ["分类过滤"],
  "sort": "排序方式（同浏览接口）"
}
```

**响应：**`comics` 为 Pagination 结构。

---

## 收藏夹

### 获取收藏列表

```
GET /users/favourite?page={page}&s={sort}
```

**参数：**同漫画浏览接口的 `page` 和 `s`。

**响应：**`comics` 为 Pagination 结构。

---

## 发现与推荐

### 随机推荐

```
GET /comics/random
```

**响应：**`comics` 数组（非分页），约 20 条 ComicListItem。每次请求返回不同结果。

### 热门排行榜

```
GET /comics/leaderboard?tt={timeRange}&ct={countType}
```

**参数：**

| 参数 | 值 | 说明 |
|---|---|---|
| `tt` | `H24` | 过去 24 小时 |
| `tt` | `D7` | 过去 7 天 |
| `tt` | `D30` | 过去 30 天 |
| `ct` | `VC` | 按浏览量排行（目前唯一有效值） |

**响应：**`comics` 数组（非分页），最多 40 条。每项额外包含 `leaderboardCount` 和 `viewsCount` 字段。

### 策划合集

```
GET /collections
```

**响应：**`collections` 数组，每项：

| 字段 | 类型 | 说明 |
|---|---|---|
| `title` | string | 合集标题（如"本子妹推薦"） |
| `comics` | ComicListItem[] | 合集内漫画列表 |

### 热门搜索词

```
GET /keywords
```

**响应：**`keywords` 字符串数组，如 `["蘿莉", "巨乳", "3D", ...]`。

### Banner 横幅

```
GET /banners
```

**响应：**`banners` 数组，每项：

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | string | Banner ID |
| `title` | string | 标题 |
| `shortDescription` | string | 简短描述 |
| `type` | string | 类型（如 `ads`） |
| `link` | string | 点击跳转链接 |
| `thumb` | Thumb | Banner 图片 |

---

## 排序方式汇总

| 值 | 说明 | 适用接口 |
|---|---|---|
| `ua` | 默认排序 | 浏览、搜索 |
| `dd` | 最新发布 | 浏览、搜索 |
| `da` | 最早发布 | 浏览、搜索 |
| `ld` | 最多喜欢 | 浏览、搜索 |
| `vd` | 最多浏览 | 浏览、搜索 |

## 注意事项

- 所有图片 URL 中的 `fileServer` 和 `path` 需要拼接：`{fileServer}/static/{path}`
- 项目服务端代理会自动替换 S3 图片 URL（通过 `replaceFileUrl`），客户端直接使用 `fileUrl` 即可
- Token 有效期约 7 天（从 JWT 的 `iat`/`exp` 推算）
- 分页接口 `page` 从 1 开始
