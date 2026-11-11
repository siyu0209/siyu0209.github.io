/**
 * v-reveal —— 滚动揭示指令
 *
 * 用法：
 *   <section v-reveal>           进入视口即落定
 *   <div v-reveal="120">        延迟 120ms 再落定（用来做列表阶梯）
 *
 * 设计说明：
 * 1. 全站共用一个 IntersectionObserver，避免每个元素各建一个观察器。
 * 2. 只触发一次——落定后立刻 unobserve，往回滚不会反复出现，减少视觉噪音。
 * 3. 系统开启「减少动态效果」或浏览器不支持 IntersectionObserver 时，
 *    直接给终态，不做动画，内容一定可见。
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

let observer = null

/** 惰性创建共享观察器：首次使用时才建，页面无需动效时不会产生开销 */
function getObserver() {
  if (observer) return observer

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    },
    // 元素露出 12% 就落定；底部留 6% 余量，避免「贴到底边才开始动」
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )

  return observer
}

export default {
  mounted(el, binding) {
    const delay = Number(binding.value) || 0
    el.classList.add('reveal')
    if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}ms`)

    const reduced = window.matchMedia(REDUCED_MOTION).matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed')
      return
    }

    getObserver().observe(el)
  },

  unmounted(el) {
    observer?.unobserve(el)
  },
}
