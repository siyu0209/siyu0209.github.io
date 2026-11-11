<script setup>
/**
 * 站点外壳
 * 职责：两栏骨架 + 路由出口 + 页脚。所有页面共用，页面本身只管自己的内容。
 *
 * 桌面（lg+）：左侧 320px 固定栏常驻，右侧内容独立滚动。
 * 移动端：单列堆叠，左侧栏退化为页头。
 *
 * 无障碍：第一个可聚焦元素是「跳到主要内容」。
 * 左栏有 5 个导航项 + 若干联系链接，键盘用户每次进页面都得按十几次 Tab 才能到正文，
 * 这个跳转链接就是为这条路径准备的；它平时被移出视口，聚焦时才滑进来。
 */
import SiteAside from '@/components/SiteAside.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import ToastHost from '@/components/ToastHost.vue'
</script>

<template>
  <!-- 键盘跳过链接：只对 Tab 可见，鼠标用户看不到也不会误触 -->
  <a href="#main" class="skip-link">跳到主要内容</a>

  <div class="mx-auto max-w-page px-gutter lg:px-12">
    <div class="lg:grid lg:grid-cols-[minmax(18rem,20rem)_minmax(0,1fr)] lg:gap-x-20">
      <SiteAside />

      <!--
        min-w-0 防止长英文/代码把栅格撑破。
        tabindex="-1" 让「跳到主要内容」能把焦点真正移进来（不加的话部分浏览器只滚不聚焦）。
      -->
      <main id="main" tabindex="-1" class="min-w-0 pb-16 outline-none lg:py-24">
        <RouterView />
        <SiteFooter />
      </main>
    </div>
  </div>

  <!-- Toast 全站只挂一次，用 Teleport 挂到 body -->
  <ToastHost />
</template>
