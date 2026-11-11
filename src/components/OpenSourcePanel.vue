<script setup>
/**
 * 开源项目数据模块
 * 职责：开源类项目在成果摘要下方补一组「仓库证据」——Star、贡献者、核心模块。
 *
 * 为什么把 Star / 贡献者留成破折号也不隐藏：
 *   面试官看开源项目，第一反应是「有没有人在用」。数字没填时，
 *   明说「暂无公开数据」比假装这栏不存在更诚实，也不会让版式塌掉。
 */
import { computed } from 'vue'
import StatGrid from './StatGrid.vue'
import TagList from './TagList.vue'
import EmptyNote from './EmptyNote.vue'
import SectionHeading from './SectionHeading.vue'

const props = defineProps({
  project: { type: Object, required: true },
})

const stats = computed(() => [
  {
    label: 'Star',
    value: props.project.repoStars,
    hint: props.project.repoStars === null ? '仓库尚未公开' : '',
  },
  {
    label: 'Contributors',
    value: props.project.contributors,
    hint: props.project.contributors === null ? '暂无公开数据' : '',
  },
  { label: 'Modules', value: props.project.coreModule.length || null, hint: '' },
])
</script>

<template>
  <section class="mt-10">
    <SectionHeading v-reveal title="开源数据" eyebrow="Repository" />
    <div v-reveal="40">
      <StatGrid :stats="stats" />
    </div>

    <div v-if="project.coreModule.length" v-reveal="80" class="mt-6">
      <p class="mb-3 font-mono text-xs uppercase tracking-widest text-fg-faint">核心模块</p>
      <TagList :items="project.coreModule" />
    </div>
    <div v-else v-reveal="80" class="mt-6">
      <EmptyNote icon="cube" title="核心模块还没拆分记录" hint="之后会补上各层的职责划分" />
    </div>
  </section>
</template>
