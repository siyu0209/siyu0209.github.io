<script setup>
/**
 * 区块标题
 * 职责：统一「序号 + 中文标题 + 英文对照 + 延伸细线」的区块起始样式。
 * 序号用等宽字体 + 强调色，是整站唯一的编号系统，用来建立秩序感；
 * 英文对照用小号字、弱化色，给 HR 与技术面试官一眼可扫的关键词锚点。
 *
 * 序号可省略（详情页的小节不参与全站编号），省略时不渲染位数占位。
 */
defineProps({
  index: { type: String, default: '' },
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-7 flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap">
    <span v-if="index" class="font-mono text-xs text-accent">{{ index }}</span>
    <h2 class="text-base tracking-widest text-fg-secondary">{{ title }}</h2>
    <span v-if="eyebrow" class="font-mono text-xs uppercase tracking-widest text-fg-faint">
      {{ eyebrow }}
    </span>
    <span class="ml-1 hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
  </div>
</template>
