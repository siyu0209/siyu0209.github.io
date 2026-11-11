<script setup>
/**
 * 标签列表
 * 职责：技术栈 / 分类等短标签的统一呈现：等宽字体 + 描边胶囊。
 * 用等宽字体是刻意的——技术标签属于「数据」，不属于「文案」。
 */
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <ul class="flex flex-wrap gap-2">
    <li
      v-for="item in items"
      :key="item"
      class="rounded-full border border-line-subtle px-3 py-1 font-mono text-xs text-fg-muted"
    >
      {{ item }}
    </li>
  </ul>
</template>
