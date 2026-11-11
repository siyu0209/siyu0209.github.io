/**
 * 轻提示（Toast）
 * 职责：提供一个全站可调用的 showToast()，状态放在模块作用域而不是组件里，
 *       这样任何组件都能触发，不必层层透传 props / emits。
 *
 * 只保留一条消息：连续触发时后一条覆盖前一条，并重置计时器。
 */
import { readonly, ref } from 'vue'

const text = ref('')
const visible = ref(false)

let hideTimer = null

/**
 * 弹出一条提示
 * @param {string} message 提示文案
 * @param {number} duration 停留毫秒数
 */
export function showToast(message, duration = 2000) {
  text.value = message
  visible.value = true

  window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    visible.value = false
  }, duration)
}

/** 组件侧只读消费，防止外部直接改状态 */
export function useToast() {
  return { text: readonly(text), visible: readonly(visible) }
}
