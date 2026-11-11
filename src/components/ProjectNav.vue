<script setup>
/**
 * 项目翻页
 * 职责：按 projects.json 的数组顺序给出「上一个 / 下一个」。
 *
 * 到两端不循环：首尾相接会让人一直在同一批项目里打转，
 * 也分不清「已经看完了」。缺的那侧渲染一句位置说明，保持两列高度一致。
 */
import AppIcon from './AppIcon.vue'

defineProps({
  prev: { type: Object, default: null },
  next: { type: Object, default: null },
})
</script>

<template>
  <nav class="mt-14 grid gap-4 border-t border-line-subtle pt-6 sm:grid-cols-2" aria-label="项目翻页">
    <!-- 上一个 -->
    <RouterLink
      v-if="prev"
      :to="`/projects/${prev.id}`"
      class="group flex min-w-0 flex-col rounded-lg border border-line-subtle p-4 transition-colors duration-base ease-out-soft hover:border-accent"
    >
      <span class="flex items-center gap-1.5 font-mono text-xs text-fg-faint">
        <AppIcon name="arrow-left" :size="12" />
        上一个
      </span>
      <span
        class="mt-2 truncate text-md text-fg transition-colors duration-base ease-out-soft group-hover:text-accent"
      >
        {{ prev.title }}
      </span>
    </RouterLink>
    <p
      v-else
      class="flex items-center rounded-lg border border-dashed border-line px-4 py-4 font-mono text-xs text-fg-faint"
    >
      已经是第一个项目
    </p>

    <!-- 下一个 -->
    <RouterLink
      v-if="next"
      :to="`/projects/${next.id}`"
      class="group flex min-w-0 flex-col rounded-lg border border-line-subtle p-4 transition-colors duration-base ease-out-soft hover:border-accent sm:items-end sm:text-right"
    >
      <span class="flex items-center gap-1.5 font-mono text-xs text-fg-faint">
        下一个
        <AppIcon name="arrow-right" :size="12" />
      </span>
      <span
        class="mt-2 max-w-full truncate text-md text-fg transition-colors duration-base ease-out-soft group-hover:text-accent"
      >
        {{ next.title }}
      </span>
    </RouterLink>
    <p
      v-else
      class="flex items-center rounded-lg border border-dashed border-line px-4 py-4 font-mono text-xs text-fg-faint sm:justify-end"
    >
      已经是最后一个项目
    </p>
  </nav>
</template>
