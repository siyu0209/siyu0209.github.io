# 周涛 · 技术作品集官网

2027 届应届生个人作品集。纯静态站，无后端。技术栈：**Vite + Vue 3 + Vue Router + Tailwind CSS v4**，不使用任何第三方组件库。

---

## 项目简介

一页式作品集，读者是 HR 与技术面试官：左侧常驻身份栏，右侧是作品与能力。

- **面向岗位**：客户端开发 / 前端开发 / 工具开发。
- **内容主线**：Android 客户端与 FFmpeg 播放内核为主，兼有 VS Code 扩展与协议转换工具；技术栈 Vue3 / TypeScript / Python / C# / FFmpeg / 接口协议解析。
- **页面结构**：首屏定位 → `#work` 精选项目（可筛选卡片网格）→ `#stack` 能力矩阵 → `#about` 关于 → `#journey` 经历 → `#contact` 联系。每个项目另有独立详情页 `/projects/:id`。
- **数据驱动**：所有文案与项目都写在 `src/data/projects.json` 与 `src/data/profile.json`，改内容不用碰组件。
- **没有后端**：没有数据库、没有接口、没有登录。构建出来的 `dist/` 是纯静态文件，丢到任何静态托管都能跑。
- **设计约束**：颜色 / 字号 / 间距 / 动效全部定义在 `src/styles/tokens.css`，组件里不写魔法值；想换肤只改这一个文件。

---

## 依赖安装与本地启动

**环境要求**：Node.js `^20.19.0` 或 `>=22.12.0`（Vite 8 的下限），npm 随 Node 自带。先 `node -v` 确认版本，版本太低 `npm install` 会直接报错。

```bash
npm install      # 首次安装依赖
npm run dev      # 开发服务器 http://127.0.0.1:5173
```

只有六个包：运行时 `vue`、`vue-router`，构建期 `vite`、`@vitejs/plugin-vue`、`tailwindcss`、`@tailwindcss/vite`。**没有任何 UI 组件库**——看到的每个按钮、卡片、筛选条、灯箱都是 `src/components/` 里的自建组件。

其他脚本：

```bash
npm run build    # 生产构建，产物在 dist/
npm run preview  # 本地预览 dist/ 产物（http://127.0.0.1:4173）
```

> 端口被占用时开发服务器会直接报错而不是悄悄换端口（`strictPort: true`），避免你以为在 5173 其实在 5174。

---

## 目录结构

```
.
├── index.html                  唯一 HTML 入口（lang="zh-CN"、SEO meta + Open Graph、/favicon.svg）
├── vite.config.js              Vite 配置：Vue 插件 / Tailwind 插件 / @ 别名 / 端口
├── vercel.json                 Vercel 部署配置：SPA 路由回落 + 静态资源一年缓存
├── .gitignore                  忽略依赖、构建产物、本地日志与 .vercel
├── package.json                依赖与脚本
├── public/                     原样拷贝进 dist/ 的静态资源（不走打包）
│   ├── favicon.svg                 站点图标：32×32，姓名首字母 Y 的橙色折线
│   └── og-cover.png                分享卡片封面：1200×630
└── src/
    ├── main.js                 应用入口：创建实例 → 注册指令 → 挂路由 → 挂载；按序引入全局样式
    ├── App.vue                 根组件：跳转链接 + 左侧身份栏 + 右侧滚动内容区（<RouterView />）
    ├── assets/                 图片、图标资源（当前为空占位）
    ├── components/             通用复用组件
    │   ├── SiteAside.vue           左栏：姓名 / 定位 / 锚点导航 / 社交链接
    │   ├── SiteFooter.vue          页脚：版权年份与站点技术栈
    │   ├── SectionHeading.vue      小节标题：序号 + 中文标题 + 英文对照 + 细线
    │   ├── FilterBar.vue           项目分类筛选条（按钮组，只负责抛事件）
    │   ├── ProjectCard.vue         项目卡片：封面 / 角标 / 标题 / 简介 / 标签 / 快捷入口
    │   ├── ProjectGlyph.vue        无截图时的程序化 SVG 封面（五种图形，按 glyph 字段取）
    │   ├── TagList.vue             技术栈标签组
    │   ├── AppIcon.vue             全站唯一的图标表（内联 SVG，按 name 取路径）
    │   ├── EmptyNote.vue           统一空状态：虚线框 + 一句话 + 去哪个字段填数据
    │   ├── HighlightBoard.vue      成果摘要看板：highlights 三格横向大字
    │   ├── StatGrid.vue            指标网格：label / 数值 / 备注三列（空值显示破折号）
    │   ├── OpenSourcePanel.vue     开源类专属：Star / 贡献者 / 核心模块三格 + 模块标签
    │   ├── DesktopPanel.vue        桌面类专属：支持平台 + 核心功能两个模块
    │   ├── EfficiencyPanel.vue     AI / 效率类专属：效率数据看板 + 替代的手工步骤
    │   ├── ProjectHero.vue         详情页首图：有 cover 用图，无 cover 用应用窗口框
    │   ├── ImageLightbox.vue       图片放大层：左右切换 / ESC 关闭 / 焦点归还 / 锁滚动
    │   ├── ActionBar.vue           底部操作区：按 category 决定主次按钮顺序
    │   ├── ProjectNav.vue          上一个 / 下一个项目（按 JSON 顺序，两端不循环）
    │   ├── SkillMatrix.vue         能力矩阵：四组技能卡，每项一个带图标标签 + 一句能力证明
    │   ├── TimelineList.vue        竖向时间线：左侧竖线与圆点首尾收口，右侧节点说明
    │   ├── ContactPanel.vue        联系区：邮箱一键复制 / GitHub 链接 / 微信二维码预留位
    │   └── ToastHost.vue           轻提示宿主：Teleport 到 body，底部居中胶囊，2 秒自动消失
    ├── composables/            组合式函数（跨组件共享的状态与能力）
    │   ├── useToast.js             showToast()：模块级状态，任何组件都能触发提示
    │   └── useClipboard.js         copyText()：优先 Clipboard API，非安全上下文回退 execCommand
    ├── directives/             自定义指令
    │   ├── reveal.js               v-reveal：进入视口时揭示一次，之后不再回弹
    │   └── spotlight.js            v-spotlight：把指针坐标写进 --mx / --my
    ├── views/                  页面级组件（路由目标）
    │   ├── HomeView.vue            首页
    │   └── ProjectDetailView.vue   项目详情页
    ├── router/
    │   └── index.js            路由表：路径映射、滚动行为（含锚点）、懒加载、切换后写 SEO
    ├── utils/
    │   └── seo.js              全站唯一的 SEO 出口：按路由解析 title / description / OG / canonical
    ├── data/                   数据层：改内容不用碰组件
    │   ├── projects.json           项目数据源（唯一项目事实来源）
    │   ├── profile.json            个人信息：定位 / 简介 / 能力矩阵 / 时间线 / 联系方式
    │   ├── contact.js              从 profile.json 读出联系方式，供左栏 / 页脚 / 联系区共用
    │   └── categories.js           分类枚举 → 中文标签 + 筛选选项
    └── styles/
        ├── tokens.css          设计 Token：颜色 / 字号 / 间距 / 圆角 / 阴影 / 动效
        ├── base.css            重置、元素默认值、焦点环、滚动条、减弱动效
        └── motion.css          动效层：滚动揭示 / 指针辉光 / 卡片悬停 / 网格淡入淡出
```

---

## 三条硬规则

### 1. 颜色、字体、间距只准从 Token 取

`src/styles/tokens.css` 用 Tailwind v4 的 `@theme` 定义，一次定义同时产出：

- 原生 CSS 变量 —— `var(--color-accent)`
- 工具类 —— `bg-accent` / `text-fg-muted` / `px-gutter` / `rounded-md`

**禁止**在组件里写 `#f2683c`、`margin-top: 13px` 这类魔法值。换肤只改 Token 第 4 节「语义别名」，组件零改动。

命名对齐：文字用 `fg-*`，描边用 `line-*`，避免出现 `text-text-primary`、`border-border` 这种双词类名。

### 2. 新增一个项目，只改 JSON

在 `src/data/projects.json` 里复制一个对象、改字段即可，不需要碰任何组件代码。

字段约定（`null` 表示暂未填写，不是空字符串；`null` 的字段在页面上自动隐藏，不会渲染成空白）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | URL 片段，必须唯一，短横线小写 |
| `title` | string | 项目名（卡片 `h3` 与详情页 `h1`） |
| `subtitle` | string | 副标题，详情页标题下方一行 |
| `category` | string | `opensource` / `desktop` / `ai` / `efficiency`，决定筛选归属与中文标签 |
| `glyph` | string | 无封面时用的程序化图形：`player` / `download` / `toolbox` / `ai` / `code` |
| `year` | number \| null | 年份，卡片左上角角标 |
| `role` | string | 担任角色，如「独立开发」 |
| `techStack` | string[] | 技术栈；卡片取前 3 个 + `+N`，详情页全展示 |
| `cover` | string \| null | 封面图路径（16:10）。**有值时自动顶替 `glyph`**，详情页首图也用它 |
| `gallery` | {src,caption}[] | 详情页功能图集，双列、点击放大；空数组显示「实机截图整理中」 |
| `summary` | string | 一句话简介，建议 ≤ 40 字（卡片截断两行） |
| `highlights` | string[] | 技术要点，详情页顶部看板取前 3 条，建议 3 条、每条 ≤ 20 字 |
| `efficiency` | {label,value}[] | 效率看板，`ai` / `efficiency` 类详情页用；空数组显示空状态 |
| `background` `difficulty` `solution` `result` | string \| null | 详情页三段正文：项目背景与目标 / 核心难点 / 解决方案与成果（`result` 挂在第三段末尾） |
| `supportPlatforms` | string[] \| null | 平台清单。卡片右下角标取第一个词（`Windows 10` → `Windows`），桌面类详情页左侧模块 |
| `downloadCount` | number \| null | 下载量，桌面类详情页的指标 |
| `featureList` | string[] \| null | 功能清单，桌面类右模块 / 效率类「替代的手工步骤」 |
| `repoStars` | number \| null | Star 数。有值才在卡片「开源」角标后拼 `★ N`，详情页进开源看板 |
| `contributors` | number \| null | 贡献者数，开源看板第二格 |
| `coreModule` | string[] \| null | 核心模块，开源看板第三格取数量 + 下方标签组 |
| `links` | object | 四个键 `demo` / `repo` / `download` / `docs`，各为 `string \| null`；驱动底部操作区 |

分类的中文说法与筛选顺序在 `src/data/categories.js`，改文案只动这一处。

#### 图片怎么放（同样不用改代码）

1. 把图片丢进 `public/` 下自建的目录，例如 `public/projects/video-player/cover.png`。`public/` 里的文件会**原样拷进 `dist/`**，不经过打包、不做压缩、不改文件名。
2. JSON 里写**以 `/` 开头的路径**：`"cover": "/projects/video-player/cover.png"`。不要写 `public/…`，不要写 `./…`，也不要用 `@/`——后三种都会 404。
3. 刷新页面即可。`cover` 有值时自动顶替 `glyph` 程序化图形；图集写成 `"gallery": [{ "src": "/projects/xxx/shot-1.png", "caption": "解码链路" }]`，`caption` 同时用作图片 `alt` 和灯箱底部说明。

尺寸与体积：

| 用途 | 比例 | 建议尺寸 | 单张体积 |
|---|---|---|---|
| `cover` 封面 | 16:10 | 1600 × 1000 | ≤ 300 kB |
| `gallery` 图集 | 16:10 或 4:3 | 宽 1600 | ≤ 300 kB |
| `contact.wechatQr` | 1:1 | 512 × 512 | ≤ 100 kB |

- 界面截图用 PNG（文字边缘干净），照片类用 JPG。不要传 HEIC，浏览器不认。
- 文件名只用小写字母、数字、短横线。中文名和空格会被转义成一长串 `%E4%BD%A0`，出问题时很难排查。
- 图片不在首屏链路上：卡片图 `loading="lazy"`，详情页首图 `fetchpriority="high"`。所以图片体积影响的是滚动体验，不影响首屏那 64 kB。

### 详情页的七个区块（从上到下）

| # | 区块 | 数据来源 | 空数据时 |
|---|---|---|---|
| 1 | 标题区：返回 / 标题 / 副标题 / 年份·角色·技术栈 | `title` `subtitle` `year` `role` `techStack` | 年份显示「年份待补充」 |
| 2 | 成果摘要看板（三格） | `highlights` | 显示「技术要点还没写」 |
| 3 | 类型模块（按 `category` 三选一） | `repoStars` `contributors` `coreModule` / `supportPlatforms` `featureList` / `efficiency` | 各自显示空状态并提示填哪个字段 |
| 4 | 首图（点击放大） | `cover` | 用应用窗口框 + 程序化图形 |
| 5 | 三段正文（行宽 68ch） | `background` `difficulty` `solution` `result` | 单段显示「这部分内容还没写」 |
| 6 | 功能图集（双列，点击放大） | `gallery` | 「实机截图整理中」 |
| 7 | 操作区 + 上下项目 | `links` / JSON 顺序 | 「对外链接还没挂上」 |

图片放大层支持 `←` `→` 循环切换、`ESC` 关闭、点击空白处关闭；关闭后焦点回到触发它的缩略图。

### 首页区块与锚点

锚点编号 01–05 与左栏导航一致；首屏不占编号，一进页面就是它。

| 锚点 | 区块 | 数据来源 |
|---|---|---|
| — | 首屏：一句话定位 + 简介 + 求职方向 | `profile.statement` `profile.intro` |
| `#work` | 01 精选项目：分类筛选 + 卡片网格（1 / 2 / 3 列） | `projects.json` |
| `#stack` | 02 能力矩阵：四组技能卡，每项一句能力证明 | `profile.skills` |
| `#about` | 03 关于：第一人称简介 + 三条工作原则 | `profile.about` `profile.principles` |
| `#journey` | 04 经历：竖向时间线 | `profile.timeline` |
| `#contact` | 05 联系：邮箱一键复制 / GitHub / 微信二维码位 | `profile.contact` |

### `profile.json` 的字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` `nameNote` | string | 姓名与并排小字（当前是 `YG` / `2027`） |
| `role` `status` `tagline` | string | 左栏定位、状态胶囊文案、一句话签名 |
| `statement` `intro` | string | 首屏主标题与跟随简介 |
| `about` | string | 关于区第一人称简介（≤ 120 字） |
| `principles` | string[] | 三条工作原则，关于区编号列表 |
| `skills` | {group,icon,items[{name,icon,proof}]}[] | 能力矩阵。**组名与每项的 `proof` 都要能被面试官追问**，别写「精通」 |
| `timeline` | {period,title,description}[] | 时间线节点，按时间正序；最后一条通常是当前状态 |
| `contact` | {email,github,wechatQr} | 三个键都可为 `null`。`email` 有值才出现「复制」按钮；`wechatQr` 填图片路径才有二维码 |

`icon` 取值必须存在于 `src/components/AppIcon.vue` 的图标表里；写错时该图标不渲染，其余内容照常显示。

### 3. 页面级组件放 `views/`，复用组件放 `components/`

路由目标一律懒加载，避免首包被拖大。

---

## 无障碍与键盘

- 页面第一个可聚焦元素是「跳到主要内容」（`.skip-link`），回车直接把焦点送进 `<main id="main">`，不用逐项 Tab 过导航。
- 所有内容图片都有 `alt`：卡片图「<项目名> 界面截图」、首图「<项目名> 封面」、图集用 caption、二维码「微信二维码，扫码添加 YG」。纯装饰的内联 SVG 一律 `aria-hidden="true"`，不进无障碍树。
- 只有图标没有文字的按钮都带 `aria-label`：复制邮箱（含地址本身）、源码 / 下载（含项目名与「在新标签页打开」）、放大查看（含图注）、灯箱的关闭 / 上一张 / 下一张。
- 灯箱是 `role="dialog" aria-modal="true"`：打开时锁 `body` 滚动并把焦点送到关闭键，关闭时把焦点还给刚才点击的那张图。
- Tab 顺序实测（375 宽首页）：跳转链接 → 5 项锚点导航 → 5 个筛选按钮 → 5 张项目卡 → 页脚。
- **全站不写 `hover:` 前缀**。Tailwind v4 会把 `hover:` 编进 `@media (hover: hover)`，而触摸屏（`hover: none`）上这段永远不生效、悬停效果彻底丢失。所以统一写成「基础态 + `:hover` + `:focus-within`」，键盘 Tab 到卡片时能看到和鼠标悬停一样的边框与位移。
- 焦点环统一由 `:focus-visible` 给 `--shadow-focus`，不用浏览器默认描边（暗底上默认环几乎看不见）。

---

## SEO 与分享卡片

- 每页的 `title` / `description` 由 `src/utils/seo.js` 的 `resolveSeo()` 一处产出，`router.afterEach` 调用 `applySeo()` 写进文档：
  - 首页：`YG · 技术作品集` + 定位描述
  - 详情页：`<项目名> · <角色> · YG`，描述取 `summary` + 前三个技术栈
  - 地址写错：`未找到项目 · YG` + `robots: noindex, follow`（`og:type` 也退回 `website`，不伪装成文章）
- Open Graph / Twitter 一并写入：`og:type`（详情页 `article`）、`og:site_name`、`og:locale`、`og:title`、`og:description`、`og:url`、`og:image`（绝对地址 + 1200×630 + `image:alt`）、`twitter:card=summary_large_image`，以及 `<link rel="canonical">`。
- `index.html` 里另外硬编码了一份首页的 OG 标签，给不执行 JS 的抓取器兜底（某些微信 / 飞书版本就是这样取卡片）。
- ⚠️ **上线前必须替换域名**：`src/utils/seo.js` 的 `SITE_URL` 与 `index.html` 里的 `og:url` / `og:image` 两处都还是 `https://yg-portfolio.example.com`。不改的话分享卡片会指向一个不存在的域，图片也抓不到。
- 分享封面是 `public/og-cover.png`（1200×630，52 kB）。改文案就重画这张图，别改文件名——`OG_IMAGE` 和 `index.html` 都写死了它。

---

## 性能

生产构建实测（`npm run build` + `npm run preview`，CDP 读 `encodedDataLength`，**gzip 后**）：

| 页面 | 首访传输 | 构成 |
| --- | --- | --- |
| 首页 | **64.2 kB** / 4 个请求 | HTML 1.5 + CSS 7.3 + JS 56.1 + favicon 0.8 |
| 详情页 | **约 71.6 kB** / 5 个请求 | 首页那份公共资源 + 懒加载的 `ProjectDetailView` 6.6 kB |

- **零图片、零外部字体请求**：首屏不被图片和字体阻塞，也没有 FOUT/FOIT。`og-cover.png` 那 52 kB 只被抓取器下载，不进首屏。
- 详情页是独立 chunk，首页不加载；同理 404 页也只按需拉它。
- 图片策略：列表卡片图 `loading="lazy"` + `decoding="async"`（不在首屏，晚点拉）；详情页首图 `fetchpriority="high"` 且**不加** `loading="lazy"`，否则 LCP 反而被推迟；图集其余图片 `lazy`。
- 动效统一 560ms / `cubic-bezier(0.16, 1, 0.3, 1)`，只改 `tokens.css` 一处就能全站换节奏；`prefers-reduced-motion: reduce` 下所有位移归零、滚动变瞬时。

---

## 常见问题

**改了 JSON，页面没变？**
先看浏览器控制台。JSON 多一个逗号会整站白屏，报错形如 `key must be a string at line 14 column 22`。其次确认 `id` 没和已有项目重复，图片路径以 `/` 开头。

**卡片上为什么是个几何图形，不是截图？**
`cover` 为 `null` 时用 `glyph` 画程序化封面（五种图形），这是设计选择不是缺图——空着的截图位比几何图形更像半成品。填上 `cover` 或换 `glyph` 取值即可。

**有些数字显示成「—」？**
字段是 `null`。页面用破折号占位而不是隐藏整格，否则三列会变两列。**这里不编数字**：`year`、`downloadCount`、`repoStars`、`contributors` 空着就是空着。

**联系区 / 左栏社交链接不见了？**
`profile.json` 的 `contact` 三个键都是 `null` 时整块按空状态渲染。填了 `email` 才会出现「复制」按钮，填了 `github` 才会出现链接。

**详情页刷新变成 404？**
History 模式需要托管商把未知路径回落成 `index.html`。仓库根目录的 `vercel.json` 已经配好 rewrites；换到别的托管商见下一节。

**想换主色？**
只改 `src/styles/tokens.css` 里 `accent-500 / 600 / 400` 三个值，全站跟随。`accent-contrast` 是按钮上的字色，要一起调，否则对比度会掉。

**为什么 `hover:` 前缀的类在自己电脑上没效果？**
触摸屏（`hover: none`）下 Tailwind 把 `hover:` 编进 `@media (hover: hover)`，永远不生效。本项目统一写「基础态 + `:hover` + `:focus-within`」，用键盘 Tab 也能看到同样的边框与位移。**加新组件时别用 `hover:` 前缀**。

**能加博客 / 后台吗？**
当前是纯静态数据驱动。加博客要引入 Markdown 解析与列表路由，加后台等于引入服务端——都属于结构性改动，不是改个 JSON 的事。

---

## 部署（两条路，选一条）

两条路产物一样，区别只在网址形态：GitHub Pages 是**子路径**（`https://用户名.github.io/仓库名/`），Vercel 是**根路径**（`https://项目名.vercel.app`）。前者不用注册新账号，后者以后能绑自己的域名。

### 路线 A：GitHub Pages（一条命令）

只需要一个 GitHub 令牌，其余脚本全包了。

1. 打开 <https://github.com/settings/tokens> → **Generate new token (classic)** → 勾选 **`repo`** → 生成并复制（形如 `ghp_xxx`）。
2. 在本项目根目录执行：

```powershell
.\scripts\publish.ps1 -Token ghp_你的令牌
```

脚本会依次完成：校验账号 → 没有仓库就自动建一个公开仓库（默认名 `portfolio`）→ 用 `/<仓库名>/` 前缀构建 → 初始化 git 并推送 `main` → 打开仓库的 Pages 服务 → 打印最终网址。

3. 等 1–2 分钟，访问 `https://<你的用户名>.github.io/<仓库名>/`。

以后改了内容，再跑一次同样的命令就会重新发布；也可以直接 `git push`，Pages 会自己重建。

> **为什么要用脚本构建**：Pages 的站点在子路径下，必须 `BASE_PATH=/<仓库名>/` 构建，否则 JS/CSS 会去根目录找、整页白屏。脚本已经处理；手动跑 `npm run build` 得到的是根路径包，**不能**直接传 Pages。
>
> 令牌只用于这一次推送，脚本推完会立刻把 `.git/config` 里的 remote 改回普通地址，不留在仓库里。

### 路线 B：Vercel（根路径，以后可绑域名）

#### 第 1 步：本地初始化 git

```bash
git init
git add .
git commit -m "init: 个人作品集"
git branch -M main
```

`.gitignore` 已排除 `node_modules/`、`dist/`、`.vercel/` 与本地日志，不会把依赖和构建产物推上去。

#### 第 2 步：创建远程仓库

GitHub 右上角 **New repository** → 名字填 `zhoutao-portfolio` → **不要**勾选 README / .gitignore / license（本地已有）→ Create。复制页面给出的仓库地址。

#### 第 3 步：推送代码

```bash
git remote add origin https://github.com/<你的用户名>/zhoutao-portfolio.git
git push -u origin main
```

以后每次改完内容：`git add . && git commit -m "update: 新增项目" && git push`，Vercel 会自动重新部署。

#### 第 4 步：Vercel 导入

1. 用 GitHub 账号登录 [vercel.com](https://vercel.com)。
2. **Add New… → Project** → 在列表里找到 `zhoutao-portfolio` → **Import**。
3. 配置页保持默认。Vercel 会自动识别 Vite：Install `npm install`、Build `npm run build`、Output `dist`。仓库根目录的 `vercel.json` 把这四项和 SPA 回落都写死了，不用手填。
4. 点 **Deploy**，等 30–60 秒，拿到 `https://zhoutao-portfolio-xxx.vercel.app`。

部署完做一件事：随便点进一个项目详情页，然后 **刷新**。能正常显示说明 rewrites 生效；如果 404，先确认 `vercel.json` 在仓库根目录（不是 `src/` 里）。

#### 第 5 步：绑定自定义域名（可选）

1. 项目页 → **Settings → Domains** → 输入域名 → **Add**。
2. 去域名商加解析：
   - 根域名：`A` 记录 → `76.76.21.21`
   - 子域名 `www`：`CNAME` → `cname.vercel-dns.com`
3. 回 Vercel 点 **Refresh**，状态变绿后自动签发 HTTPS 证书（约 1 分钟）。
4. 在 **Settings → Domains** 里把主域名设为根域名，另一个 301 跳过来。

> 换域名后**必须**带着真实域名重新构建一次（`$env:VITE_SITE_URL='https://你的域名'`），否则 `og:url`、`canonical`、分享图地址还指向旧的 `*.vercel.app`。

### 换到别的托管商

路由用 HTML5 History 模式，URL 干净（`/projects/video-player`），但静态托管必须把 404 回落成 `index.html`：

- **Netlify / Cloudflare Pages**：默认已处理，无需配置
- **GitHub Pages**：`npm run build` 之后 `scripts/postbuild.mjs` 已自动生成 `dist/404.html`（并写入 `.nojekyll`），无需手动处理
- **Nginx**：`location / { try_files $uri $uri/ /index.html; }`

---

## 上线自检清单（10 条）

逐条打勾，全过再投简历。

- [ ] **1. 域名已替换**：`grep -rn "yg-portfolio.example.com" src index.html` 搜不到任何结果。真实域名通过 `VITE_SITE_URL` 环境变量传入（构建时写进 `og:url`、`canonical`、`og:image`），不再手改文件。
- [ ] **2. 构建干净**：`npm run build` 无报错；`npm run preview` 首页正常，点进详情页后**刷新**不 404。
- [ ] **3. 分享图可访问**：浏览器直接打开 `https://你的域名/og-cover.png` 能看到 1200×630 的图；`curl -I` 返回 `200` 且 `content-type: image/png`。
- [ ] **4. 分享卡片正确**：把链接贴进微信 / 飞书 / [Twitter Card Validator](https://cards-dev.twitter.com/validator)，标题、描述、大图都对。改完域名要重新抓一次，平台有缓存。
- [ ] **5. 三页 SEO 正确**：首页 `title=周涛 · 技术作品集`；详情页 `<项目名> · 周涛`；乱填 `/projects/xxx` 显示「这个地址没有对应的项目」且 `robots=noindex, follow`。看 DevTools 的 Elements，不是「查看源代码」。
- [ ] **6. 联系方式填全**：`contact.email` / `github` / `wechatQr` 三项都填了；左栏、页脚、联系区三处都能看到，点「复制」能拿到邮箱。
- [ ] **7. 文案自审**：`timeline` 的四个节点都是真实年份（2026）；17 条 `skills[].proof` 每条都经得起追问；`projects.json` 的背景 / 难点 / 方案 / 成果讲的是真事。**没有一个数字是编的**。
- [ ] **8. 手机实机检查**：真机打开，375 宽度下导航换成两行、没有横向滚动条、卡片单列、字号不挤。
- [ ] **9. 键盘与减弱动效**：Tab 第一下出现「跳到主要内容」，回车焦点进正文；详情页图片按 ESC 能关且焦点回到那张图；系统开「减弱动态效果」后没有位移动画。
- [ ] **10. 没有死链**：每个按钮都指向真实地址——没放简历就不要留「下载简历」，没配仓库就不要留「源码」。控制台 0 error。

> 第 7 条最容易被追问：写「熟悉 FFmpeg」不如写「用 FFmpeg 做过解码与渲染分层」。数据里的 `null` 是诚实的空位，别用编造的数字填满。

---

## 浏览器支持

面向现代浏览器（Chrome / Edge / Safari / Firefox 近两年版本）。使用了 `dvh`、`color-mix`、CSS 自定义属性等特性；`prefers-reduced-motion: reduce` 下自动关闭位移动画与平滑滚动。
