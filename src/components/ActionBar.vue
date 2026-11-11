<script setup>
/**
 * 底部操作区
 * 职责：把对外链接按「主 / 次」两档排出来，主按钮按项目类型决定。
 *
 * 主次规则（不是随便定的，跟着读者的目的地走）：
 *   开源项目 → 源码仓库是主，因为读者要去看代码；
 *   客户端 → 下载是主，因为读者要拿去用；
 *   AI / 效率类 → 在线体验是主，功能要先摸到才有感觉。
 *
 * 链接全空时不渲染死链，给一条带提示的空状态。
 */
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import EmptyNote from './EmptyNote.vue'

const props = defineProps({
  project: { type: Object, required: true },
})

// 每种项目的按钮优先级，排在前面的当主按钮
const priority = {
  opensource: ['repo', 'docs', 'demo', 'download'],
  desktop: ['download', 'repo', 'docs', 'demo'],
  ai: ['demo', 'repo', 'docs', 'download'],
  efficiency: ['repo', 'demo', 'download', 'docs'],
}

const labels = {
  repo: '源码仓库',
  demo: '在线体验',
  download: '软件下载',
  docs: '文档',
}

const icons = {
  repo: 'code',
  demo: 'arrow-up-right',
  download: 'download',
  docs: 'list',
}

const actions = computed(() => {
  const order = priority[props.project.category] ?? priority.opensource
  return order
    .filter((key) => Boolean(props.project.links?.[key]))
    .map((key, i) => ({ key, label: labels[key], icon: icons[key], url: props.project.links[key], primary: i === 0 }))
})
</script>

<template>
  <section class="mt-12">
    <div v-if="actions.length" class="flex flex-wrap items-center gap-3">
      <a
        v-for="action in actions"
        :key="action.key"
        :href="action.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors duration-base ease-out-soft"
        :class="
          action.primary
            ? 'bg-accent font-medium text-accent-contrast hover:bg-accent-hover'
            : 'border border-line text-fg-secondary hover:border-accent hover:text-accent'
        "
      >
        <AppIcon :name="action.icon" :size="16" />
        {{ action.label }}
      </a>
    </div>

    <EmptyNote
      v-else
      icon="external"
      title="链接整理中"
      hint="代码公开后会补上仓库与下载地址"
    />
  </section>
</template>
