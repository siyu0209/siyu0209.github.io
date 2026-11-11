/**
 * 联系方式派生数据
 * 职责：把 profile.json 里的 contact 三个字段，统一翻译成「可直接渲染的链接」，
 *       避免左栏、页脚、联系区三处各写一遍判断逻辑（改一处就要改三处）。
 *
 * 约定：值为 null 时对应条目自动隐藏，不会出现空 href 的死链。
 */
import profile from '@/data/profile.json'

const contact = profile.contact ?? {}

// 邮箱：用于 mailto 链接与「一键复制」
export const contactEmail = contact.email || null

// GitHub：外部链接，新窗口打开
export const contactGitHub = contact.github || null

// 微信二维码：有就渲染图片，没有就渲染预留位
export const contactWechatQr = contact.wechatQr || null

/**
 * 左栏 / 页脚用的横排链接。
 * external 为 false 的用当前页打开（mailto 不该开新标签页）。
 */
export const contactLinks = [
  contactEmail ? { label: '邮箱', href: `mailto:${contactEmail}`, external: false } : null,
  contactGitHub ? { label: 'GitHub', href: contactGitHub, external: true } : null,
].filter(Boolean)
