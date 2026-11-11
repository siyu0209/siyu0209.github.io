<script setup>
/**
 * 项目图形位
 * 职责：在「没有截图」的位置放一张程序化生成的抽象图形，代替灰色占位块。
 *
 * 为什么这么做：
 *   1. 现阶段没有真实截图，空图位会让整页看起来像半成品；
 *   2. 用 SVG 画，不产生任何图片请求，静态站零成本；
 *   3. 图形与项目语义对应（波形 / 队列 / 方块），比通用图标更有信息量；
 *   4. 以后有了真截图，把本组件换成 <img> 即可，外部接口不变。
 */
defineProps({
  variant: {
    type: String,
    // player | download | ai | code | toolbox
    default: 'player',
  },
  /**
   * 外框比例：
   *   4/3      —— 详情页正文里的大图位（默认）
   *   16/10    —— 首页卡片封面，和真实截图的常见比例对齐
   *   fill     —— 撑满父容器，由父级决定比例（卡片里要配合 hover 缩放用）
   */
  ratio: {
    type: String,
    default: '4/3',
  },
  /**
   * 裸图模式：去掉自带的边框 / 圆角 / 底色。
   * 卡片封面已经由 <article> 提供外框，这里再加一层就是双重描边。
   */
  bare: {
    type: Boolean,
    default: false,
  },
})

// 播放器：波形幅度序列（左半段是已播放部分，用强调色）
const waveBars = [8, 16, 25, 11, 30, 19, 9, 26, 34, 17, 12, 22, 29, 13, 9, 18]

// AI 工作台：一段输入 + 左右两列输出，表达「同一个 prompt 喂给两个模型并排对比」
const aiColumns = [
  { x: 18, widths: [40, 32, 36], tone: 'fill-accent/70' },
  { x: 66, widths: [36, 28, 20], tone: 'fill-ink-600' },
]

// 代码插件：四行代码，首行是当前行（强调色），行首递进缩进
const codeLines = [
  { x: 18, y: 26, w: 44, active: true },
  { x: 28, y: 36, w: 52, active: false },
  { x: 28, y: 46, w: 30, active: false },
  { x: 18, y: 56, w: 48, active: false },
]

// 下载器：三行任务，第三行进度条长度不同，表达「队列里进度不一」
const queueRows = [
  { y: 30, progress: 0.78 },
  { y: 44, progress: 1 },
  { y: 58, progress: 0.24 },
]

// 工具箱：九宫格里点亮其中四个，表达「一组小工具」而不是一个大工具
const toolboxCells = [
  { x: 18, y: 26, on: true },
  { x: 40, y: 26, on: false },
  { x: 62, y: 26, on: true },
  { x: 18, y: 48, on: false },
  { x: 40, y: 48, on: true },
  { x: 62, y: 48, on: false },
  { x: 18, y: 70, on: true },
  { x: 40, y: 70, on: false },
  { x: 62, y: 70, on: false },
]
</script>

<template>
  <div
    class="relative overflow-hidden"
    :class="[
      bare ? '' : 'rounded-md border border-line-subtle bg-surface-raised',
      ratio === 'fill' ? 'h-full w-full' : ratio === '16/10' ? 'aspect-16/10' : 'aspect-4/3',
    ]"
  >
    <!-- 播放器：已播放进度 + 波形 -->
    <svg
      v-if="variant === 'player'"
      viewBox="0 0 120 90"
      class="h-full w-full"
      aria-hidden="true"
    >
      <rect x="16" y="20" width="88" height="2" rx="1" class="fill-line" />
      <rect x="16" y="20" width="46" height="2" rx="1" class="fill-accent" />
      <rect
        v-for="(h, i) in waveBars"
        :key="i"
        :x="18 + i * 5.4"
        :y="76 - h"
        width="3"
        :height="h"
        rx="1.5"
        :class="i < 8 ? 'fill-accent' : 'fill-ink-600'"
      />
    </svg>

    <!-- 下载器：任务队列 + 进度条 -->
    <svg
      v-else-if="variant === 'download'"
      viewBox="0 0 120 90"
      class="h-full w-full"
      aria-hidden="true"
    >
      <g v-for="(row, i) in queueRows" :key="i">
        <rect x="18" :y="row.y" width="84" height="6" rx="3" class="fill-ink-750" />
        <rect
          x="18"
          :y="row.y"
          :width="84 * row.progress"
          height="6"
          rx="3"
          :class="row.progress === 1 ? 'fill-tech' : 'fill-accent'"
        />
      </g>
      <path
        d="M60 66 v10 m0 0 l-4 -4 m4 4 l4 -4"
        class="stroke-fg-faint"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        transform="translate(0,-14)"
      />
    </svg>

    <!-- AI 工作台：输入条 + 两列流式输出 -->
    <svg v-else-if="variant === 'ai'" viewBox="0 0 120 90" class="h-full w-full" aria-hidden="true">
      <rect x="18" y="22" width="84" height="7" rx="3.5" class="fill-ink-750" />
      <rect x="18" y="22" width="46" height="7" rx="3.5" class="fill-accent/70" />
      <g v-for="(col, c) in aiColumns" :key="c">
        <rect
          v-for="(w, i) in col.widths"
          :key="i"
          :x="col.x"
          :y="40 + i * 9"
          :width="w"
          height="4"
          rx="2"
          :class="col.tone"
        />
      </g>
    </svg>

    <!-- 代码插件：代码行 + 右侧插件位 -->
    <svg
      v-else-if="variant === 'code'"
      viewBox="0 0 120 90"
      class="h-full w-full"
      aria-hidden="true"
    >
      <rect
        v-for="(line, i) in codeLines"
        :key="i"
        :x="line.x"
        :y="line.y"
        :width="line.w"
        height="4"
        rx="2"
        :class="line.active ? 'fill-accent' : 'fill-ink-600'"
      />
      <line x1="88" y1="22" x2="88" y2="68" class="stroke-line" stroke-width="1" />
      <rect x="94" y="30" width="10" height="3" rx="1.5" class="fill-ink-750" />
      <rect x="94" y="38" width="10" height="10" rx="2" class="fill-accent/70" />
      <rect x="94" y="54" width="10" height="3" rx="1.5" class="fill-ink-750" />
    </svg>

    <!-- 工具箱：九宫格 + 括号 -->
    <svg v-else viewBox="0 0 120 90" class="h-full w-full" aria-hidden="true">
      <rect
        v-for="(cell, i) in toolboxCells"
        :key="i"
        :x="cell.x"
        :y="cell.y"
        width="18"
        height="16"
        rx="3"
        :class="cell.on ? 'fill-accent/70' : 'fill-ink-750'"
      />
      <path
        d="M100 28 l8 8 -8 8"
        class="stroke-fg-faint"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>
