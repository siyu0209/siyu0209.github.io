<script setup>
/**
 * 轻提示宿主
 * 职责：全站唯一的 Toast 渲染点，挂在 App.vue 里一次即可。
 *
 * 为什么用 Teleport：
 *   提示要浮在所有内容之上，如果留在页面的层叠上下文里（比如被某个
 *   transform / overflow 的祖先裁掉），早晚会出问题。直接挂到 body 最稳。
 *
 * 可访问性：
 *   role="status" + aria-live="polite"，读屏会念出来，但不打断当前朗读。
 */
import AppIcon from '@/components/AppIcon.vue'
import { useToast } from '@/composables/useToast.js'

const { text, visible } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4"
        role="status"
        aria-live="polite"
      >
        <p
          class="flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-2 text-sm text-fg shadow-float"
        >
          <AppIcon name="check" :size="14" class="text-tech" />
          {{ text }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
