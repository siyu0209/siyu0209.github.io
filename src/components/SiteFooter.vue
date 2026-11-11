<script setup>
/**
 * 页脚
 * 职责：收尾信息——联系方式（移动端在左栏看不到，这里补一份）、技术栈声明、版权。
 * 刻意做得很轻：作品集的重点在上面的内容，页脚不该抢注意力。
 */
import profile from '@/data/profile.json'
import { contactLinks } from '@/data/contact.js'

// 年份取当前时间，避免手动维护
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-section-sm border-t border-line-subtle pt-8 lg:mt-section">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <p class="font-mono text-xs text-fg-faint">© {{ currentYear }} {{ profile.name }}</p>
      <p class="font-mono text-xs text-fg-faint">本站基于 Vue 3 + Tailwind CSS 搭建</p>
    </div>

    <!-- 联系方式：未填写的条目自动隐藏（contactLinks 已过滤） -->
    <ul v-if="contactLinks.length" class="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      <li v-for="link in contactLinks" :key="link.label">
        <a
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noreferrer' : undefined"
          class="font-mono text-xs text-fg-muted transition-colors duration-base ease-out-soft hover:text-accent"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </footer>
</template>
