/**
 * 联系方式派生数据
 * 职责：把 profile.json 里的 contact 字段，统一翻译成「可直接渲染的链接」，
 *       避免左栏、页脚、联系区三处各写一遍判断逻辑（改一处就要改三处）。
 *
 * 约定：值为 null 时对应条目自动隐藏，不会出现空 href 的死链。
 *
 * 关于简历：
 *   简历是 public 目录下的静态文件，路径同样要过一遍 asset()，
 *   否则部署到子路径（例如 GitHub Pages 的项目站点）时会 404。
 */
import profile from '@/data/profile.json'
import { asset } from '@/utils/asset.js'

const contact = profile.contact ?? {}

// 邮箱：用于 mailto 链接与「一键复制」
export const contactEmail = contact.email || null

// GitHub：外部链接，新窗口打开
export const contactGitHub = contact.github || null

// 微信二维码：有就渲染图片，没有就渲染预留位
export const contactWechatQr = contact.wechatQr || null

// 简历 PDF：文件放在 public/resume.pdf，换简历直接覆盖同名文件即可
export const contactResume = contact.resume ? asset(contact.resume) : null

// 下载时用的文件名：不能直接叫 resume.pdf，HR 存到桌面后认不出来是谁的
export const contactResumeFileName = contactResume ? '周涛-简历.pdf' : null

/**
 * 左栏 / 页脚用的横排链接。
 * external 为 false 的用当前页打开（mailto 不该开新标签页）。
 */
export const contactLinks = [
  contactEmail ? { label: '邮箱', href: `mailto:${contactEmail}`, external: false } : null,
  contactGitHub ? { label: 'GitHub', href: contactGitHub, external: true } : null,
  contactResume ? { label: '简历', href: contactResume, external: true } : null,
].filter(Boolean)
