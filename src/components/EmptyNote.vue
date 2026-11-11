<script setup>
/**
 * 空状态
 * 职责：数据没填时给一句人话，而不是留白、更不是渲染出 "null"。
 *
 * 用虚线描边而不是实线：视觉上明确「这里还没内容」，不会被误读成加载失败。
 */
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, default: 'inbox' },
  title: { type: String, required: true },
  hint: { type: String, default: '' },
})
</script>

<template>
  <div class="rounded-md border border-dashed border-line px-5 py-6">
    <p class="flex items-center gap-2 text-sm text-fg-muted">
      <AppIcon :name="icon" class="shrink-0 text-fg-faint" />
      {{ title }}
    </p>
    <p v-if="hint" class="mt-2 pl-6 font-mono text-xs text-fg-faint">{{ hint }}</p>
  </div>
</template>
