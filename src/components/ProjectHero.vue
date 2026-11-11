<script setup>
/**
 * 首图
 * 职责：详情页顶部的整幅视觉位，有封面就给真图并可点开放大，没封面就给一个窗口框。
 *
 * 没有封面时不做一块灰底空白，而是画成「应用窗口」：
 * 标题栏三个圆点 + 项目 id + 里面的程序化图形。
 * 这样即使截图没到位，这一屏看起来也是「产品的样子」，不是「图丢了」。
 */
import ProjectGlyph from './ProjectGlyph.vue'
import AppIcon from './AppIcon.vue'
import { asset } from '@/utils/asset.js'

defineProps({
  project: { type: Object, required: true },
})

const emit = defineEmits(['open'])
</script>

<template>
  <div class="mt-10">
    <!-- 有封面：整块可点 -->
    <button
      v-if="project.cover"
      type="button"
      class="hero-shot group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-line-subtle bg-surface"
      :aria-label="`放大查看 ${project.title} 封面`"
      @click="emit('open')"
    >
      <img
        :src="asset(project.cover)"
        :alt="`${project.title} 封面`"
        class="hero-shot__media aspect-16/10 w-full object-cover"
        fetchpriority="high"
        decoding="async"
      />
      <span
        class="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/80 px-2.5 py-1 font-mono text-xs text-fg-secondary backdrop-blur-sm"
      >
        <AppIcon name="expand" :size="12" />
        点击放大
      </span>
    </button>

    <!-- 无封面：应用窗口 -->
    <figure v-else class="overflow-hidden rounded-lg border border-line-subtle bg-surface">
      <div
        class="flex items-center gap-1.5 border-b border-line-subtle bg-surface-raised px-4 py-2.5"
      >
        <span v-for="dot in 3" :key="dot" class="h-2 w-2 rounded-full bg-line-strong" />
        <span class="ml-2 truncate font-mono text-xs text-fg-faint">
          {{ project.id }} — preview
        </span>
      </div>
      <div class="aspect-16/10 bg-canvas p-6">
        <ProjectGlyph :variant="project.glyph" ratio="fill" bare />
      </div>
      <figcaption
        class="border-t border-line-subtle px-4 py-2.5 font-mono text-xs text-fg-faint"
      >
        程序化预览 · 实机截图待补充
      </figcaption>
    </figure>
  </div>
</template>
