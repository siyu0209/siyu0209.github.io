<script setup>
/**
 * 图片放大（轻量 lightbox）
 * 职责：给首图与图集一个全屏查看层，支持左右切换与 ESC 关闭。
 *
 * 实现要点：
 *   1. 用 Teleport 挂到 body —— 否则会被右侧滚动容器的层叠上下文裁掉；
 *   2. 打开时锁 body 滚动，并把焦点移到关闭按钮；关闭时焦点还给触发元素，
 *      键盘用户不会「打开一次就丢了位置」；
 *   3. 左右切换是循环的，只有一张图时不渲染箭头（渲染了点了没反应更像坏了）；
 *   4. 淡入 + 轻微缩放，时长走 token，减弱动效时直接显示。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  // [{ src, caption }]
  images: { type: Array, default: () => [] },
  index: { type: Number, default: 0 },
})

const emit = defineEmits(['close', 'update:index'])

const closeRef = ref(null)
let lastFocus = null
let previousOverflow = ''

const total = computed(() => props.images.length)
const current = computed(() => props.images[props.index] ?? null)
const counter = computed(
  () =>
    `${String(props.index + 1).padStart(2, '0')} / ${String(total.value).padStart(2, '0')}`,
)

// 循环切换：到最后一张再往右回到第一张
function step(delta) {
  if (total.value < 2) return
  emit('update:index', (props.index + delta + total.value) % total.value)
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lastFocus = document.activeElement
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      await nextTick()
      closeRef.value?.focus()
    } else {
      document.body.style.overflow = previousOverflow
      if (lastFocus instanceof HTMLElement) lastFocus.focus()
      lastFocus = null
    }
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = previousOverflow || ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="open && current"
        class="fixed inset-0 z-50 flex flex-col bg-canvas/95 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="`图片查看：${current.caption || '项目截图'}`"
        @click.self="emit('close')"
      >
        <!-- 顶栏：计数 + 关闭 -->
        <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p class="font-mono text-xs text-fg-faint">{{ counter }}</p>
          <button
            ref="closeRef"
            type="button"
            class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-fg-muted transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="18" />
            <span class="sr-only">关闭</span>
          </button>
        </div>

        <!-- 图区 -->
        <div
          class="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16"
          @click.self="emit('close')"
        >
          <button
            v-if="total > 1"
            type="button"
            class="absolute left-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-canvas/70 text-fg-secondary transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent sm:left-4"
            aria-label="上一张"
            @click="step(-1)"
          >
            <AppIcon name="chevron-left" :size="20" />
          </button>

          <img
            :src="current.src"
            :alt="current.caption || '项目截图'"
            class="lightbox__frame max-h-full max-w-full rounded-md object-contain"
            @click.stop
          />

          <button
            v-if="total > 1"
            type="button"
            class="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-canvas/70 text-fg-secondary transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent sm:right-4"
            aria-label="下一张"
            @click="step(1)"
          >
            <AppIcon name="chevron-right" :size="20" />
          </button>
        </div>

        <!-- 说明 -->
        <p
          v-if="current.caption"
          class="shrink-0 px-6 pb-5 text-center font-mono text-xs text-fg-muted"
        >
          {{ current.caption }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
