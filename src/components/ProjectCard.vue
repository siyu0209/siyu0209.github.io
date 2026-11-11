<script setup>
/**
 * 项目卡片
 * 职责：项目网格里的单张卡片——封面、角标、标题、一句话简介、技术标签、源码/下载快捷入口。
 *
 * 关于「整张卡可点 + 卡内小按钮单独可点」：
 *   <a> 里不允许再套 <a>，所以卡片本体用 <article>，
 *   再铺一层绝对定位的透明 <RouterLink> 承接整卡点击（视觉上什么也看不到，键盘 Tab 却能停在它上面）；
 *   卡片内的源码/下载链接排在这一层之后并抬高层级，点击天然落在链接上，
 *   不依赖 stopPropagation —— 它们和覆盖层是兄弟节点，本来就不存在冒泡关系。
 */
import { computed } from 'vue'
import ProjectGlyph from '@/components/ProjectGlyph.vue'
import { categoryLabel } from '@/data/categories.js'
import { asset } from '@/utils/asset.js'

const props = defineProps({
  project: { type: Object, required: true },
})

const p = computed(() => props.project)

// 卡片上只露 3 个标签，剩下的折成 +N，避免标签换行把卡片撑高
const shownTags = computed(() => p.value.techStack.slice(0, 3))
const restCount = computed(() => Math.max(0, p.value.techStack.length - shownTags.value.length))

const isOpenSource = computed(() => p.value.category === 'opensource')
const isDesktop = computed(() => p.value.category === 'desktop')

/**
 * 开源角标：有 Star 数就一并显示，没填就只写「开源」。
 * 绝不编一个数字上去 —— 面试官顺手点进仓库就能对账。
 */
const openSourceBadge = computed(() =>
  p.value.repoStars === null || p.value.repoStars === undefined
    ? '开源'
    : `开源 ★ ${p.value.repoStars}`,
)

/**
 * 客户端角标：只有真的填了下载地址才敢写「可下载」，
 * 否则退一步写它运行在哪个平台（这是确定信息），不拿「可下载」骗点击。
 */
const desktopBadge = computed(() => {
  if (p.value.links.download) return '可下载'
  // "Windows 10" → "Windows"：角标位置小，只留平台名，版本号留给详情页
  const platform = p.value.supportPlatforms?.[0]
  return platform ? platform.replace(/\s*\d+(\.\d+)*$/, '') : ''
})

// 快捷入口按数据是否存在决定要不要出现，空链接不渲染
const actions = computed(() =>
  [
    { key: 'repo', label: '源码', href: p.value.links.repo },
    { key: 'download', label: '下载', href: p.value.links.download },
  ].filter((a) => a.href),
)
</script>

<template>
  <article class="project-card group relative flex h-full flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface">
    <!-- 封面：固定 16:10，指针移上来时整体放大 1.03 倍，父级 overflow-hidden 负责裁掉溢出 -->
    <div class="relative aspect-16/10 overflow-hidden border-b border-line-subtle bg-surface-raised">
      <div class="project-card__visual h-full w-full">
        <!--
          卡片最宽 400 CSS px，两倍屏也只要 800px 宽；
          所以优先用 800×500 缩略图（约 33 kB，原图 110 kB），
          大屏高倍屏再靠 srcset 回退到原图，避免一屏 300 kB 的封面把首屏拖慢。
        -->
        <img
          v-if="p.cover"
          :src="asset(p.coverThumb ?? p.cover)"
          :srcset="p.coverThumb ? `${asset(p.coverThumb)} 800w, ${asset(p.cover)} 1600w` : null"
          :sizes="p.coverThumb ? '(min-width: 1280px) 400px, (min-width: 768px) 45vw, 92vw' : null"
          :alt="`${p.title} 界面截图`"
          class="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <ProjectGlyph v-else :variant="p.glyph" ratio="fill" bare />
      </div>

      <!-- 左上：年份角标 -->
      <span
        v-if="p.year"
        class="absolute left-3 top-3 rounded-full border border-line bg-canvas/70 px-2 py-0.5 font-mono text-xs text-fg-faint backdrop-blur-sm"
      >
        {{ p.year }}
      </span>

      <!-- 右上：开源标识（开源类专属） -->
      <span
        v-if="isOpenSource"
        class="absolute right-3 top-3 rounded-full border border-tech/40 bg-canvas/70 px-2 py-0.5 font-mono text-xs text-tech backdrop-blur-sm"
      >
        {{ openSourceBadge }}
      </span>

      <!-- 右下：可下载标识（客户端专属） -->
      <span
        v-if="isDesktop && desktopBadge"
        class="absolute bottom-3 right-3 rounded-full border border-accent/40 bg-canvas/70 px-2 py-0.5 font-mono text-xs text-accent backdrop-blur-sm"
      >
        {{ desktopBadge }}
      </span>
    </div>

    <!-- 文字区 -->
    <div class="flex flex-1 flex-col gap-2.5 p-5">
      <div class="flex items-baseline gap-2">
        <h3 class="line-clamp-2 text-md font-medium text-fg">{{ p.title }}</h3>
        <span class="ml-auto shrink-0 font-mono text-xs text-fg-faint">
          {{ categoryLabel(p.category) }}
        </span>
      </div>

      <p class="line-clamp-2 text-sm text-fg-muted">{{ p.summary }}</p>

      <!-- 标签（贴底对齐，保证同排卡片的技术栈行在同一条水平线上） -->
      <div class="mt-auto flex items-end justify-between gap-3 pt-3">
        <ul class="flex flex-wrap items-center gap-1.5">
          <li
            v-for="tag in shownTags"
            :key="tag"
            class="rounded-full border border-line-subtle px-2 py-0.5 font-mono text-xs text-fg-faint"
          >
            {{ tag }}
          </li>
          <li v-if="restCount" class="font-mono text-xs text-fg-faint">+{{ restCount }}</li>
        </ul>

        <!-- 快捷入口：层级高于整卡覆盖层，点它不会跳详情页 -->
        <div v-if="actions.length" class="flex shrink-0 items-center gap-2">
          <a
            v-for="action in actions"
            :key="action.key"
            :href="action.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${action.label}：${p.title}（在新标签页打开）`"
            class="relative z-10 flex items-center gap-1 rounded-sm border border-line px-2 py-1 font-mono text-xs text-fg-muted transition-colors duration-fast ease-out-soft hover:border-accent hover:text-accent"
          >
            <svg
              v-if="action.key === 'repo'"
              viewBox="0 0 16 16"
              class="h-3 w-3"
              aria-hidden="true"
            >
              <circle cx="4" cy="3.5" r="1.6" class="fill-current" />
              <circle cx="4" cy="12.5" r="1.6" class="fill-current" />
              <circle cx="12" cy="5" r="1.6" class="fill-current" />
              <path
                d="M4 5.1v5.8M4 8.5c0-2 8-1.2 8-3.2"
                class="stroke-current"
                stroke-width="1.2"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else viewBox="0 0 16 16" class="h-3 w-3" aria-hidden="true">
              <path
                d="M8 2.5v7M8 9.5 5 6.5M8 9.5l3-3M3 12.5h10"
                class="stroke-current"
                stroke-width="1.3"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ action.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- 整卡点击层：铺满卡片盖在背景之上、文字之下，视觉无痕 -->
    <RouterLink
      :to="`/projects/${p.id}`"
      class="absolute inset-0"
      :aria-label="`查看项目：${p.title}`"
    />
  </article>
</template>
