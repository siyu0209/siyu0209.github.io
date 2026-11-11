<script setup>
/**
 * 左侧固定栏（站点身份区）
 * 职责：常驻展示「我是谁 / 我在做什么 / 怎么联系」，并在桌面端提供锚点导航。
 *
 * 布局说明：
 *   桌面（lg+）——sticky 满屏高，分上下两段：上段身份与导航，下段联系方式。
 *   移动端——退化为普通页头，只保留身份信息与一条横向导航。
 */
import profile from '@/data/profile.json'
import { contactLinks } from '@/data/contact.js'

// 锚点导航。序号与 SectionHeading 的编号保持一致，形成同一套秩序。
const navItems = [
  { href: '#work', index: '01', label: '精选项目' },
  { href: '#stack', index: '02', label: '能力矩阵' },
  { href: '#about', index: '03', label: '关于' },
  { href: '#journey', index: '04', label: '经历' },
  { href: '#contact', index: '05', label: '联系' },
]
</script>

<template>
  <aside
    class="max-lg:border-b max-lg:border-line-subtle max-lg:pt-14 max-lg:pb-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:py-24"
  >
    <div>
      <!-- 身份 -->
      <p class="flex items-baseline gap-2">
        <span class="text-4xl font-semibold tracking-tight text-fg">{{ profile.name }}</span>
        <span class="font-mono text-xs text-fg-faint">/ {{ profile.nameNote }}</span>
      </p>

      <p class="mt-3 text-lg text-fg-secondary">{{ profile.role }}</p>
      <p class="mt-2 max-w-xs text-sm text-fg-muted">{{ profile.tagline }}</p>

      <!-- 状态胶囊：整站唯一的「动态」元素，用录制红橙点强调 -->
      <p
        class="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-secondary"
      >
        <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60"
          />
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        {{ profile.status }}
      </p>

      <!-- 导航：桌面端竖排；移动端换行铺开（不用横向滚动，否则 375 下「05 联系」会被裁在视口外） -->
      <nav class="mt-10 max-lg:mt-6" aria-label="页面内导航">
        <ul class="flex flex-wrap gap-x-5 gap-y-0 lg:flex-col lg:gap-y-3">
          <li v-for="item in navItems" :key="item.href">
            <a
              :href="item.href"
              class="group flex items-baseline gap-3 whitespace-nowrap py-1 transition-colors duration-base ease-out-soft hover:text-fg"
            >
              <span
                class="font-mono text-xs text-fg-faint transition-colors duration-base ease-out-soft group-hover:text-accent"
                >{{ item.index }}</span
              >
              <span class="text-sm text-fg-muted transition-colors duration-base ease-out-soft group-hover:text-fg">
                {{ item.label }}
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 联系方式：未填写的条目自动隐藏（contactLinks 已过滤），不会出现空链接 -->
    <ul class="mt-10 hidden gap-5 lg:flex">
      <li v-for="link in contactLinks" :key="link.label">
        <a
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noreferrer' : undefined"
          class="font-mono text-xs text-fg-faint transition-colors duration-base ease-out-soft hover:text-accent"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </aside>
</template>
