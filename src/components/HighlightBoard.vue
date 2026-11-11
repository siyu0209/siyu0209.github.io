<script setup>
/**
 * 成果摘要看板
 * 职责：把 highlights 三条并排铺成「数据看板」的版式。
 *
 * 版式说明：
 *   三条在宽屏并列、窄屏堆叠，格与格之间用 1px 缝隙（gap-px + 底色）画分隔线，
 *   比给每个格子单独加 border 更稳——不会在折行处出现双线或断线。
 *   序号用强调色等宽字，是这一块唯一的重音；正文用大字号，让三条能被一眼读完。
 */
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const shown = computed(() => props.items.slice(0, 3))
</script>

<template>
  <div
    v-if="shown.length"
    class="grid gap-px overflow-hidden rounded-lg border border-line-subtle bg-line-subtle sm:grid-cols-3"
  >
    <div v-for="(item, i) in shown" :key="item" class="bg-surface p-5">
      <span class="font-mono text-xs text-accent">{{ String(i + 1).padStart(2, '0') }}</span>
      <p class="mt-3 text-balance text-lg text-fg">{{ item }}</p>
    </div>
  </div>
</template>
