<script setup>
/**
 * AI / 工具类项目模块
 * 职责：这类项目面试官最先看「它到底做了什么、边界在哪」，所以这一块给关键数据 + 能力清单。
 *
 * 数据来自 projects.json 的 efficiency 字段（[{ label, value, hint }]）。
 * 没填时不编数字——编一个「效率提升 300%」是最容易被追问穿的地方，
 * 改成一句明确的待补充提示，比假数字有用。
 */
import { computed } from 'vue'
import StatGrid from './StatGrid.vue'
import EmptyNote from './EmptyNote.vue'
import SectionHeading from './SectionHeading.vue'

const props = defineProps({
  project: { type: Object, required: true },
})

const metrics = computed(() => props.project.efficiency ?? [])
const features = computed(() => props.project.featureList ?? [])
</script>

<template>
  <section class="mt-10">
    <SectionHeading v-reveal title="关键数据" eyebrow="Key Facts" />

    <div v-if="metrics.length" v-reveal="40">
      <StatGrid :stats="metrics" />
    </div>
    <div v-else v-reveal="40">
      <EmptyNote
        icon="spark"
        title="关键数据待补充"
        hint="在 projects.json 的 efficiency 字段填入 [{ label, value, hint }]"
      />
    </div>

    <div v-if="features.length" v-reveal="80" class="mt-6 rounded-lg border border-line-subtle bg-surface p-5">
      <p class="font-mono text-xs uppercase tracking-widest text-fg-faint">核心能力</p>
      <ul class="mt-4 grid gap-2.5 sm:grid-cols-2">
        <li
          v-for="feature in features"
          :key="feature"
          class="flex items-start gap-2.5 text-sm text-fg-secondary"
        >
          <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-tech" aria-hidden="true" />
          {{ feature }}
        </li>
      </ul>
    </div>
  </section>
</template>
