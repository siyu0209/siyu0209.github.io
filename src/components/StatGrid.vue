<script setup>
/**
 * 指标网格
 * 职责：把「标签 + 数值」成组展示，供开源数据、效率数据两类模块复用。
 *
 * 空值处理：value 为 null 时渲染成破折号并在下方标注「暂无公开数据」，
 * 而不是把整格删掉——否则三列会缩成两列，版式抖动，也看不出这里本该有数据。
 */
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Array, default: () => [] },
})

const shown = computed(() => props.stats.slice(0, 3))
</script>

<template>
  <div
    v-if="shown.length"
    class="grid gap-px overflow-hidden rounded-lg border border-line-subtle bg-line-subtle sm:grid-cols-3"
  >
    <div v-for="stat in shown" :key="stat.label" class="bg-surface p-5">
      <p class="font-mono text-xs uppercase tracking-widest text-fg-faint">{{ stat.label }}</p>
      <p
        class="mt-2 font-mono text-2xl"
        :class="stat.value === null || stat.value === undefined ? 'text-fg-faint' : 'text-fg'"
      >
        {{ stat.value === null || stat.value === undefined ? '—' : stat.value }}
      </p>
      <p v-if="stat.hint" class="mt-1 text-xs text-fg-faint">{{ stat.hint }}</p>
    </div>
  </div>
</template>
