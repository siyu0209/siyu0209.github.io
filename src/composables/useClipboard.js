/**
 * 剪贴板
 * 职责：把「复制一段文字」封装成返回布尔值的异步函数，调用方不用关心浏览器差异。
 *
 * 两种路径：
 *   1. 现代浏览器 + 安全上下文（https / localhost）——用 navigator.clipboard；
 *   2. 其余情况（http 内网预览、老内核）——回退到临时 textarea + execCommand。
 * 回退路径不是备胎代码，本地用 IP 直接打开预览页时确实会走到这里。
 */

/**
 * @param {string} text 要写入剪贴板的文本
 * @returns {Promise<boolean>} 是否复制成功
 */
export async function copyText(text) {
  if (!text) return false

  // 路径一：标准 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 用户拒绝授权或浏览器策略拦截，继续走回退
    }
  }

  // 路径二：临时 textarea
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    // 用 fixed + 透明避免页面被撑出滚动条或闪一下
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'

    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    return ok
  } catch {
    return false
  }
}
