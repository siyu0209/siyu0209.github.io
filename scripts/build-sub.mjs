/**
 * 子路径构建
 * 职责：给 GitHub Pages 的项目站点（https://<user>.github.io/<repo>/）打一次带前缀的包。
 *
 * 用法：npm run build:sub -- /portfolio/
 *       参数就是仓库名，前后斜杠会自动补齐。
 * 不传参数时与 npm run build 等价（根路径部署）。
 */
import { execFileSync } from 'node:child_process'

const arg = process.argv[2] ?? '/'
const base = `/${arg.replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')

console.log(`[build:sub] 以 base = ${base} 构建`)
execFileSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'build'],
  { stdio: 'inherit', env: { ...process.env, BASE_PATH: base } },
)

// 复用同目录的构建后处理，保证 404.html 与 .nojekyll 一样不少
await import('./postbuild.mjs')
