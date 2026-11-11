/**
 * v-spotlight —— 指针辉光指令
 *
 * 职责：把光标相对元素的坐标写进 --mx / --my，光斑本身由 motion.css 画。
 * 指令只管「读数」，不碰视觉，换肤色 / 换半径只改 CSS。
 *
 * 性能与降级：
 * 1. pointermove 的读数合并到一帧内的 rAF 里，高速划动时不会一帧写几十次样式。
 * 2. 系统开了「减少动态效果」时不绑定——没有过渡，光斑只会生硬地闪。
 * 3. 触屏设备照常绑定但不亮：光斑的可见性交给 CSS 的 @media (hover: hover)，
 *    这样「要不要跟着指针走」和「要不要显示」各自只有一处判断，不会互相打架。
 */

const shouldSkip = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default {
  mounted(el) {
    el.classList.add('spotlight')
    if (shouldSkip()) return

    let frame = 0
    let lastEvent = null

    const flush = () => {
      frame = 0
      if (!lastEvent) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${lastEvent.clientX - rect.left}px`)
      el.style.setProperty('--my', `${lastEvent.clientY - rect.top}px`)
      lastEvent = null
    }

    const onPointerMove = (event) => {
      lastEvent = event
      if (frame) return
      frame = requestAnimationFrame(flush)
    }

    el.__spotlightMove = onPointerMove
    el.addEventListener('pointermove', onPointerMove, { passive: true })
  },

  unmounted(el) {
    if (el.__spotlightMove) {
      el.removeEventListener('pointermove', el.__spotlightMove)
      delete el.__spotlightMove
    }
  },
}
