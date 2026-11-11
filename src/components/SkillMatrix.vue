<script setup>
/**
 * 能力矩阵
 * 职责：按「领域 → 技能标签 → 一句能力证明」三级展示技能，替代传统的百分比进度条。
 *
 * 为什么不用进度条：
 *   百分比是自评，且没法验证——「Vue 85%」到底比「Vue 80%」强在哪，谁也说不清。
 *   面试官真正想知道的是「你用它能做出什么」，所以每个标签后面必须跟一句具体的证据。
 *
 * 数据完全来自 profile.json 的 skills，新增一组或一项都不用改这个组件。
 */
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  groups: { type: Array, required: true },
})
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <section
      v-for="(group, gi) in groups"
      :key="group.group"
      v-reveal="gi * 60"
      class="rounded-lg border border-line-subtle bg-surface p-5"
    >
      <!-- 组头：图标 + 组名 + 条目数，底部一条细线把标题和内容分开 -->
      <header class="flex items-center gap-2.5 border-b border-line-subtle pb-4">
        <AppIcon :name="group.icon" :size="18" class="text-tech" />
        <h3 class="text-sm font-medium text-fg">{{ group.group }}</h3>
        <span class="ml-auto font-mono text-xs text-fg-faint">
          {{ String(group.items.length).padStart(2, '0') }}
        </span>
      </header>

      <ul class="mt-4 space-y-3.5">
        <li v-for="item in group.items" :key="item.name">
          <!-- 标签本体：带图标的胶囊 -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-surface-raised px-2.5 py-1 font-mono text-xs text-fg-secondary"
          >
            <AppIcon :name="item.icon" :size="12" class="text-accent" />
            {{ item.name }}
          </span>
          <!-- 能力证明：一行短句，说清「用它做成了什么」 -->
          <p class="mt-1.5 text-xs leading-relaxed text-fg-muted">{{ item.proof }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>
