/**
 * 构建后处理
 * 职责：给 GitHub Pages 补两个它自己不会生成的文件。
 *
 * 1) 404.html —— 本站是 history 路由的单页应用，
 *    直接访问 /projects/xxx 时 GitHub Pages 找不到实体文件会返回它自己的 404 页，
 *    把 index.html 复制一份成 404.html，服务器就会回落到应用本身，再由 vue-router 渲染。
 * 2) .nojekyll —— 告诉 GitHub Pages 不要用 Jekyll 处理产物，
 *    避免以下划线开头的文件名被 Jekyll 丢掉。
 */
import { copyFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')

if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('[postbuild] 没找到 dist/index.html，先跑一次构建')
  process.exit(1)
}

copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
writeFileSync(resolve(dist, '.nojekyll'), '')

const kb = (size) => `${(size / 1024).toFixed(2)} kB`
console.log(`[postbuild] 404.html ${kb(statSync(resolve(dist, '404.html')).size)} · .nojekyll 已写入`)
