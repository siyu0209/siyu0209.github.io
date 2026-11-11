/**
 * Vite 配置
 * 职责：注册 Vue SFC 编译与 Tailwind v4 的 CSS 处理管道，定义路径别名与部署基础路径。
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * 部署基础路径
 * - 部署在根域名（Vercel / Netlify / 自有域名 / <user>.github.io）：保持 '/'
 * - 部署在 GitHub Pages 的项目子路径（/<repo>/）：构建时传环境变量
 *      PowerShell:  $env:BASE_PATH='/portfolio/'; npm run build
 *   npm 脚本里已封装成 `npm run build:sub -- /portfolio/`
 */
const basePath = process.env.BASE_PATH || '/'

/**
 * 站点根地址（协议 + 域名，末尾不带斜杠）
 * 分享卡片里的 og:url / og:image 必须是绝对地址，而爬虫通常不执行 JS，
 * 所以这一步必须在构建期写进 HTML，不能只靠运行时的 seo.js。
 */
const siteRoot = (process.env.VITE_SITE_URL || 'https://siyu0209.github.io').replace(/\/+$/, '')

/** 确保基础路径以斜杠结尾，拼地址时不会出现 host/portfolio 少了那一撇 */
const baseWithSlash = basePath.endsWith('/') ? basePath : `${basePath}/`

/** 把 index.html 里的 %SITE_URL% 换成最终的站点地址（含基础路径） */
function siteUrlPlugin() {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', `${siteRoot}${baseWithSlash}`)
    },
  }
}

export default defineConfig({
  // 资源与路由都以基础路径为前缀；src/utils/asset.js 会读同一个值处理 JSON 里的图片路径
  base: basePath,

  plugins: [
    // 单文件组件（.vue）编译
    vue(),
    // Tailwind v4：走 Vite 原生插件，不再需要 postcss.config.js
    tailwindcss(),
    // 构建期把站点地址写进 index.html 的 OG / canonical
    siteUrlPlugin(),
  ],

  resolve: {
    alias: {
      // 组件内统一用 @/xxx 引用 src 下的资源，避免 ../../ 地狱
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    host: '127.0.0.1',
    // 端口被占用时直接失败，方便我发现问题，而不是悄悄换端口
    strictPort: true,
  },

  build: {
    // 静态站部署，产物直接可丢到任意 CDN / GitHub Pages
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
