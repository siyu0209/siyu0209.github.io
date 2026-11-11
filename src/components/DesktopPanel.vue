<script setup>
/**
 * 客户端项目模块
 * 职责：客户端类项目（Android / Windows）在成果摘要下方补两块「能装在哪、能干什么」。
 *
 * 分成左右两栏而不是堆成一列：这两块在面试官眼里是同一个问题的两面
 * （适配到什么程度 / 功能覆盖到什么程度），并排看一次就能对上。
 */
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import EmptyNote from './EmptyNote.vue'
import SectionHeading from './SectionHeading.vue'

const props = defineProps({
  project: { type: Object, required: true },
})

const platforms = computed(() => props.project.supportPlatforms ?? [])
const features = computed(() => props.project.featureList ?? [])
</script>

<template>
  <section class="mt-10">
    <SectionHeading v-reveal title="运行环境与功能" eyebrow="Platform & Features" />
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- 支持平台 -->
      <div v-reveal="40" class="rounded-lg border border-line-subtle bg-surface p-5">
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
          <AppIcon name="monitor" class="text-fg-faint" />
          支持平台
        </p>
        <ul v-if="platforms.length" class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="platform in platforms"
            :key="platform"
            class="rounded-full border border-line-subtle px-3 py-1 font-mono text-xs text-fg-secondary"
          >
            {{ platform }}
          </li>
        </ul>
        <div v-else class="mt-4">
          <EmptyNote icon="monitor" title="还没记录适配平台" />
        </div>
      </div>

      <!-- 核心功能 -->
      <div v-reveal="80" class="rounded-lg border border-line-subtle bg-surface p-5">
        <p class="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-fg-faint">
          <AppIcon name="list" class="text-fg-faint" />
          核心功能
        </p>
        <ul v-if="features.length" class="mt-4 space-y-2.5">
          <li
            v-for="feature in features"
            :key="feature"
            class="flex items-start gap-2.5 text-sm text-fg-secondary"
          >
            <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {{ feature }}
          </li>
        </ul>
        <div v-else class="mt-4">
          <EmptyNote icon="list" title="功能清单还没整理" />
        </div>
      </div>
    </div>
  </section>
</template>
