/**
 * 资源路径助手
 * 职责：把数据里写的「/projects/x.jpg」这类站内绝对路径，拼上部署时的基础路径。
 *
 * 为什么需要它：
 *   本站可能部署在根域名（https://siyu0209.github.io/），
 *   也可能部署在子路径（https://siyu0209.github.io/portfolio/）。
 *   Vite 只会自动改写它自己在 HTML/CSS/JS 里识别到的资源引用，
 *   而 projects.json 里手写的路径是运行时字符串，Vite 看不见、不会处理，
 *   直接写死「/projects/x.jpg」在子路径部署时会全部 404。
 *
 * 约定：数据里继续写「/projects/x.jpg」（可读性好），渲染前统一过一遍 asset()。
 */
const BASE = import.meta.env.BASE_URL // '/' 或 '/portfolio/'

export function asset(path) {
  if (!path) return path
  // 外链、协议相对地址、内联图片原样返回，不要拼 base
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`
  return base + path.replace(/^\/+/, '')
}

export default asset
