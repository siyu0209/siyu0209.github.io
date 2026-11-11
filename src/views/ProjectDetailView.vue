<script setup>
/**
 * 项目详情页
 * 职责：把 projects.json 里的一条记录展开成「技术评审」式的完整页面。
 *
 * 阅读顺序按面试官的追问路径排：
 *   标题区 → 成果摘要 → 类型专属模块 → 首图 → 背景 / 难点 / 方案与成果 → 图集 → 操作区 → 翻页。
 *   先给结论（三条成果），再给过程（背景到成果），最后给入口。
 *
 * 空数据一律不渲染或转成空状态：
 *   同一份模板要能同时装下「资料齐全」和「只填了一半」的项目，
 *   页面上不允许出现 null、undefined、空标题或点不动的死链。
 */
import { computed, ref, watch } from 'vue'
import projects from '@/data/projects.json'
import SectionHeading from '@/components/SectionHeading.vue'
import TagList from '@/components/TagList.vue'
import HighlightBoard from '@/components/HighlightBoard.vue'
import OpenSourcePanel from '@/components/OpenSourcePanel.vue'
import DesktopPanel from '@/components/DesktopPanel.vue'
import EfficiencyPanel from '@/components/EfficiencyPanel.vue'
import ProjectHero from '@/components/ProjectHero.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import ActionBar from '@/components/ActionBar.vue'
import ProjectNav from '@/components/ProjectNav.vue'
import EmptyNote from '@/components/EmptyNote.vue'
import AppIcon from '@/components/AppIcon.vue'
import { categoryLabel } from '@/data/categories.js'
import { asset } from '@/utils/asset.js'

const props = defineProps({
  id: { type: String, required: true },
})

const projectIndex = computed(() => projects.findIndex((item) => item.id === props.id))
const project = computed(() => projects[projectIndex.value] ?? null)

/**
 * 浏览器标签标题与分享描述统一由 @/utils/seo.js 在路由 afterEach 里写，
 * 这里不再自己改 document.title —— 两个来源抢同一个字段，先后顺序一旦变动就会打架。
 */

// 序号跟着数组顺序走，不存进 JSON（插项目时不用重排编号）
const projectNo = computed(() =>
  projectIndex.value < 0 ? '' : String(projectIndex.value + 1).padStart(2, '0'),
)

// 上一个 / 下一个：按 JSON 顺序，到两端就停，不循环
const prevProject = computed(() =>
  projectIndex.value > 0 ? projects[projectIndex.value - 1] : null,
)
const nextProject = computed(() =>
  projectIndex.value >= 0 && projectIndex.value < projects.length - 1
    ? projects[projectIndex.value + 1]
    : null,
)

// 三段正文是所有项目共用的骨架，措辞先定死，缺字段时给提示而不是留空
const deepSections = computed(() => {
  const p = project.value
  if (!p) return []
  return [
    { title: '项目背景与目标', eyebrow: 'Background', body: p.background },
    { title: '核心难点', eyebrow: 'Difficulty', body: p.difficulty },
    {
      title: '解决方案与成果',
      eyebrow: 'Solution & Result',
      body: p.solution,
      result: p.result,
    },
  ]
})

/**
 * lightbox 的图片清单：封面在前，图集在后。
 * 两处入口共用一个清单，左右切换才能从封面连续翻到第二张截图。
 */
const shots = computed(() => {
  const p = project.value
  if (!p) return []
  const list = []
  if (p.cover) list.push({ src: asset(p.cover), caption: `${p.title} 封面` })
  for (const shot of p.gallery ?? []) list.push({ src: asset(shot.src), caption: shot.caption })
  return list
})

// 图集在清单里的起始下标：有封面时要跳过封面这一张
const galleryOffset = computed(() => (project.value?.cover ? 1 : 0))

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

// 换项目时把查看层关掉，否则翻页后会停在上一个项目的第 N 张图上
watch(
  () => props.id,
  () => {
    lightboxOpen.value = false
    lightboxIndex.value = 0
  },
)
</script>

<template>
  <div>
    <!-- 返回 -->
    <RouterLink
      to="/#work"
      class="group inline-flex items-center gap-2 font-mono text-xs text-fg-faint transition-colors duration-base ease-out-soft hover:text-accent"
    >
      <AppIcon
        name="arrow-left"
        :size="12"
        class="transition-transform duration-base ease-out-soft group-hover:-translate-x-0.5"
      />
      返回项目列表
    </RouterLink>

    <template v-if="project">
      <!-- 1. 标题区 -->
      <header class="mt-8">
        <p class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-fg-faint">
          <span class="text-accent">{{ projectNo }}</span>
          <span>{{ categoryLabel(project.category) }}</span>
          <span class="h-3 w-px bg-line" aria-hidden="true" />
          <span>{{ project.year ?? '年份待补充' }}</span>
        </p>

        <h1 class="mt-3 max-w-content text-balance text-display font-semibold text-fg">
          {{ project.title }}
        </h1>

        <p class="mt-3 max-w-content text-lg text-fg-secondary">{{ project.subtitle }}</p>

        <!-- 元信息：角色 + 技术栈 -->
        <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p class="font-mono text-xs text-fg-faint">
            <span class="text-fg-faint">角色</span>
            <span class="ml-2 text-fg-muted">{{ project.role }}</span>
          </p>
        </div>
        <div v-if="project.techStack.length" class="mt-3">
          <TagList :items="project.techStack" />
        </div>
      </header>

      <!-- 2. 成果摘要：三条并排，先给结论 -->
      <div v-if="project.highlights.length" v-reveal="40" class="mt-10">
        <HighlightBoard :items="project.highlights" />
      </div>
      <EmptyNote
        v-else
        v-reveal="40"
        class="mt-10"
        icon="list"
        title="技术要点还没写"
        hint="在 projects.json 的 highlights 里填 3 条，每条不超过 20 字"
      />

      <!-- 类型专属模块：开源 / 客户端 / AI -->
      <OpenSourcePanel v-if="project.category === 'opensource'" v-reveal="60" :project="project" />
      <DesktopPanel v-else-if="project.category === 'desktop'" v-reveal="60" :project="project" />
      <EfficiencyPanel v-else v-reveal="60" :project="project" />

      <!-- 3. 首图 -->
      <ProjectHero v-reveal="80" :project="project" @open="openLightbox(0)" />

      <!-- 4. 正文：三段固定小节 -->
      <section
        v-for="(section, i) in deepSections"
        :key="section.title"
        class="mt-12 max-w-measure"
      >
        <SectionHeading v-reveal :title="section.title" :eyebrow="section.eyebrow" />
        <p
          v-if="section.body"
          v-reveal="i * 40"
          class="text-base leading-relaxed text-fg-secondary"
        >
          {{ section.body }}
        </p>
        <p v-else v-reveal="i * 40" class="text-sm text-fg-faint">这部分内容还没写。</p>

        <!-- 成果单独抬出来：面试官最关心的就是「最后做成了什么」 -->
        <div
          v-if="section.result"
          v-reveal="i * 40 + 40"
          class="mt-5 border-l-2 border-accent pl-4"
        >
          <p class="font-mono text-xs uppercase tracking-widest text-accent">Result</p>
          <p class="mt-2 text-base leading-relaxed text-fg-secondary">{{ section.result }}</p>
        </div>
      </section>

      <!-- 5. 功能图集：双列，每张配说明 -->
      <section class="mt-12">
        <SectionHeading v-reveal title="功能图集" eyebrow="Gallery" />
        <ul v-if="project.gallery.length" class="grid gap-6 sm:grid-cols-2">
          <li v-for="(shot, i) in project.gallery" :key="shot.src" v-reveal="i * 60">
            <button
              type="button"
              :aria-label="`放大查看：${shot.caption}`"
              class="shot-item block w-full cursor-zoom-in overflow-hidden rounded-md border border-line-subtle bg-surface text-left"
              @click="openLightbox(i + galleryOffset)"
            >
              <img
                :src="asset(shot.src)"
                :alt="shot.caption"
                loading="lazy"
                decoding="async"
                class="shot-thumb aspect-16/10 w-full object-cover"
              />
            </button>
            <p class="mt-2 flex items-start gap-2 font-mono text-xs text-fg-faint">
              <span class="text-accent">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="text-fg-muted">{{ shot.caption }}</span>
            </p>
          </li>
        </ul>
        <EmptyNote
          v-else
          v-reveal="40"
          icon="image"
          title="实机截图整理中"
          hint="图集补上后会自动排成两列，点击可放大"
        />
      </section>

      <!-- 6. 底部操作区 -->
      <ActionBar class="mt-12" :project="project" />

      <!-- 7. 项目翻页 -->
      <ProjectNav :prev="prevProject" :next="nextProject" />
    </template>

    <!-- 找不到项目：URL 敲错、链接过期、或项目改过名都会落到这里，保持访客语气 -->
    <template v-else>
      <p class="mt-10 font-mono text-xs uppercase tracking-widest text-fg-faint">Error 404</p>

      <h1 class="mt-3 max-w-content text-balance text-display font-semibold text-fg">
        这个地址没有对应的项目
      </h1>

      <p class="mt-4 max-w-measure text-base text-fg-muted">
        可能是链接已经过期，或者这个项目改过名字。回首页能看到全部作品；如果是从别处点进来的，
        也可以直接发邮件问我。
      </p>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <RouterLink
          to="/#work"
          class="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors duration-base ease-out-soft hover:bg-accent-hover"
        >
          <AppIcon name="arrow-left" :size="16" />
          查看全部项目
        </RouterLink>
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-fg-secondary transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent"
        >
          回到首页
        </RouterLink>
      </div>
    </template>

    <!-- 图片查看层：挂在 body 上，不受内容列宽限制 -->
    <ImageLightbox
      v-model:index="lightboxIndex"
      :open="lightboxOpen"
      :images="shots"
      @close="lightboxOpen = false"
    />
  </div>
</template>
