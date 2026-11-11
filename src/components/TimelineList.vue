<script setup>
/**
 * 时间线
 * 职责：把成长路径按时间顺序竖排，克制到只有一条细线、一个小圆点、三行文字。
 *
 * 样式克制的理由：
 *   时间线最容易做过度——发光节点、渐变连线、入场动画。这里全都不做，
 *   因为它只是叙事的骨架，读者关心的是「什么时候做成了什么」。
 *
 * 连线的三态（首节点只往下、末节点只往上、中间贯穿）通过 lineClass 计算，
 * 避免首尾各多出一截「没有节点可连」的线头。
 */
defineProps({
  nodes: { type: Array, required: true },
})

/**
 * 计算每个节点左侧竖线的范围
 * @param {number} i 当前索引
 * @param {number} total 节点总数
 */
function lineClass(i, total) {
  if (total <= 1) return 'hidden'
  if (i === 0) return 'top-2 bottom-0'
  if (i === total - 1) return 'top-0 h-2'
  return 'inset-y-0'
}
</script>

<template>
  <ol>
    <li
      v-for="(node, i) in nodes"
      :key="node.title"
      v-reveal="i * 60"
      class="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4"
    >
      <!-- 左列：竖线 + 圆点。ring-canvas 用底色在圆点周围开一个缺口，线看起来是「穿过」而不是「压住」 -->
      <div class="relative flex justify-center" aria-hidden="true">
        <span class="absolute w-px bg-line-subtle" :class="lineClass(i, nodes.length)" />
        <span
          class="relative mt-2 h-1.5 w-1.5 rounded-full bg-line-strong ring-4 ring-canvas"
        />
      </div>

      <!-- 右列：时间 / 标题 / 说明。最后一个节点不留底部间距，避免整段底部空虚 -->
      <div :class="i === nodes.length - 1 ? '' : 'pb-7'">
        <p class="font-mono text-xs text-fg-faint">{{ node.period }}</p>
        <h3 class="mt-1 text-sm font-medium text-fg">{{ node.title }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-fg-muted">{{ node.description }}</p>
      </div>
    </li>
  </ol>
</template>
