/**
 * SEO 与分享卡片
 * 职责：全站唯一一份「页面标题 / 描述 / Open Graph」的读写逻辑，路由切换时调用。
 *
 * 为什么集中在这里：
 *   之前标题由 router.afterEach 写一次、详情页 watch 再写一次，两个来源抢 document.title；
 *   社交卡片又需要 title / description / url / image 四个值同时换，散在组件里必然漏。
 *
 * 关于 og:image：
 *   用的是 public/og-cover.png（1200×630，GDI+ 绘制，见 README）。
 *   绝大多数平台要求绝对地址，所以下面拼了 SITE_URL；
 *   换域名时改这一处 + index.html 里的静态 OG 两处即可。
 */

import projects from '@/data/projects.json'
import profile from '@/data/profile.json'

/**
 * 部署地址
 * 站点可能挂在根域名，也可能挂在 GitHub Pages 的项目子路径（/<repo>/），
 * 所以「站点根」与「基础路径」分开算：
 *   SITE_ROOT = https://siyu0209.github.io      （构建时由 VITE_SITE_URL 注入）
 *   BASE      = /portfolio/                      （构建时由 BASE_PATH 注入，Vite 的 BASE_URL）
 *   SITE_URL  = https://siyu0209.github.io/portfolio/
 * 没有注入时退回占位域名，页面照样能跑，只是分享卡片的链接不对。
 */
const SITE_ROOT = (import.meta.env.VITE_SITE_URL || 'https://yg-portfolio.example.com').replace(
  /\/+$/,
  '',
)

/** Vite 注入的基础路径，一定是 '/' 或以 '/' 结尾 */
const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

/** 站点根地址（带基础路径，末尾有斜杠） */
export const SITE_URL = `${SITE_ROOT}${BASE}`

/** 站点名，用于 og:site_name 与标题兜底 */
export const SITE_NAME = '周涛 · 技术作品集'

/** 分享封面（1200×630） */
export const OG_IMAGE = `${SITE_URL}og-cover.png`

/**
 * 把路由路径拼成绝对地址。
 * SITE_URL 末尾已带斜杠，path 开头的斜杠要去掉，否则会出现 //projects/x。
 */
function absoluteUrl(path) {
  return `${SITE_URL}${String(path ?? '/').replace(/^\/+/, '')}`
}

/** 首页描述：与 index.html 的静态 meta 保持一致，避免两次抓取拿到不同文案 */
export const HOME_DESCRIPTION =
  '周涛的个人技术作品集：Android 客户端、FFmpeg 播放内核、VS Code 扩展。2027 届应届生，三个项目从解码到打包发布全程独立完成。'

/**
 * 把长描述截到 n 个字符。
 * 中文没有词边界，按字符数截断比拼单词更可控；末尾补省略号。
 */
function clamp(text, n = 120) {
  const s = String(text ?? '').replace(/\s+/g, ' ').trim()
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

/**
 * 按路由解析出该页的 title / description / path / type / robots。
 * 详情页从 projects.json 直接查，不依赖组件是否已经挂载。
 */
export function resolveSeo(to) {
  const path = to?.fullPath ?? '/'

  if (to?.name === 'project-detail') {
    const project = projects.find((item) => item.id === to.params.id)

    if (project) {
      // 描述用「一句话简介 + 技术栈」：面试官在搜索结果里就想看到用了什么
      const tech = project.techStack.slice(0, 3).join(' / ')
      return {
        title: `${project.title} · 周涛`,
        description: clamp(`${project.summary}${tech ? `｜${tech}` : ''}`, 120),
        path,
        type: 'article',
        robots: 'index, follow',
      }
    }

    // 地址写错的页面不该进索引，也不该被当成文章分享出去
    return {
      title: '未找到项目 · 周涛',
      description: '这个项目地址在 projects.json 里没有对应记录。',
      path,
      type: 'website',
      robots: 'noindex, follow',
    }
  }

  return {
    title: SITE_NAME,
    description: HOME_DESCRIPTION,
    path,
    type: 'website',
    robots: 'index, follow',
  }
}

/** 取或建一个 meta 标签（按属性名 + 属性值定位，避免重复插入） */
function ensureMeta(attr, key) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  return el
}

function setMeta(attr, key, content) {
  ensureMeta(attr, key).setAttribute('content', content)
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

/**
 * 把解析结果写进文档。
 * 顺序：title → 描述 → 索引策略 → OG → Twitter → canonical，便于排查时逐段对照。
 */
export function applySeo({ title, description, path, type = 'website', robots = 'index, follow' }) {
  document.title = title

  setMeta('name', 'description', description)
  setMeta('name', 'robots', robots)

  // Open Graph：微信 / 飞书 / Slack / Twitter 都优先读这一组
  setMeta('property', 'og:type', type)
  setMeta('property', 'og:site_name', SITE_NAME)
  setMeta('property', 'og:locale', 'zh_CN')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', absoluteUrl(path))
  setMeta('property', 'og:image', OG_IMAGE)
  // 尺寸与类型必须跟 og-cover.png 的真实尺寸一致，否则部分平台会判为无效图
  setMeta('property', 'og:image:type', 'image/png')
  setMeta('property', 'og:image:width', '1200')
  setMeta('property', 'og:image:height', '630')
  setMeta('property', 'og:image:alt', `${SITE_NAME}：Android 客户端 / 开源音视频 / AI 工具链`)

  // Twitter 大图卡片
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', OG_IMAGE)

  setCanonical(absoluteUrl(path))
}

/** 供 profile 派生文案使用（避免其他模块直接拼字符串） */
export const PROFILE_HINT = clamp(profile.intro, 90)
