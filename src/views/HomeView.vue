<script setup>
/**
 * 首页
 * 职责：承载整站的叙事顺序——定位 → 作品 → 能力 → 关于 → 联系。
 *
 * 结构决策：
 *   首屏不放装饰性大图，只放一句话定位 + 一段自我介绍。
 *   理由：HR 和面试官看作品集是「扫读」，先给结论，再给证据（项目），最后给细节。
 *
 * 动效分工：
 *   首屏不做揭示（一进页面就该看见），只在下方区块用 v-reveal 依次落定；
 *   项目列表与原则列表按序号递增延迟，形成从上到下的阅读节奏。
 */
import { onBeforeUnmount, ref } from 'vue'
import profile from '@/data/profile.json'
import projects from '@/data/projects.json'
import { categoryFilters } from '@/data/categories.js'
import SectionHeading from '@/components/SectionHeading.vue'
import FilterBar from '@/components/FilterBar.vue'
import ProjectCard from '@/components/ProjectCard.vue'
import SkillMatrix from '@/components/SkillMatrix.vue'
import TimelineList from '@/components/TimelineList.vue'
import ContactPanel from '@/components/ContactPanel.vue'
import AppIcon from '@/components/AppIcon.vue'
import { contactResume, contactResumeFileName } from '@/data/contact.js'

/* ------------------------------------------------------------------
   项目筛选
   visibleProjects 是「真正参与渲染」的列表，和 activeCategory 分开存：
   如果直接拿 activeCategory 去过滤，数据会瞬间换掉，卡片是「啪」地跳变；
   这里先让整块淡出，淡完再换数据，回程天然就是淡入，中间不会闪。
   ------------------------------------------------------------------ */
const filters = categoryFilters
const activeCategory = ref('all')
const visibleProjects = ref(projects)
const isFading = ref(false)
let fadeTimer = null

function selectCategory(key) {
  if (key === activeCategory.value) return

  activeCategory.value = key
  isFading.value = true

  // 连点不同分类时，后一次要把前一次没跑完的换数据取消掉
  window.clearTimeout(fadeTimer)
  fadeTimer = window.setTimeout(() => {
    visibleProjects.value =
      key === 'all' ? projects : projects.filter((project) => project.category === key)
    isFading.value = false
  }, 160)
}

onBeforeUnmount(() => window.clearTimeout(fadeTimer))
</script>

<template>
  <div>
    <!-- ============ 首屏：一句话定位 ============ -->
    <section class="pt-10 lg:pt-0">
      <!-- 眉标：一行极小的英文，把「这是什么页面」说清楚，避免大字孤零零地悬着 -->
      <p class="font-mono text-xs uppercase tracking-[0.18em] text-fg-faint">
        Portfolio · 2026
      </p>

      <!-- text-balance：标题折成两行时自动拉平两行长度，避免末行只剩三四个字 -->
      <h1 class="mt-4 max-w-content text-balance text-display font-semibold text-fg">
        {{ profile.statement }}
      </h1>

      <p class="mt-6 max-w-content text-base leading-relaxed text-fg-muted">
        {{ profile.intro }}
      </p>

      <!--
        首屏操作：只给两个真正会被点的落点。
        「查看项目」用页内锚点（不刷新页面），「下载简历」直接给 PDF 文件。
        简历文件没配就整块隐藏，不留一个点不动的按钮。
      -->
      <div class="mt-9 flex flex-wrap items-center gap-3">
        <a
          href="#work"
          class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg transition-colors duration-base ease-out-soft hover:border-accent hover:text-accent"
        >
          查看项目
          <AppIcon name="arrow-down" :size="14" />
        </a>

        <a
          v-if="contactResume"
          :href="contactResume"
          :download="contactResumeFileName"
          class="inline-flex items-center gap-2 rounded-full border border-accent/45 px-4 py-2 text-sm text-accent transition-colors duration-base ease-out-soft hover:border-accent hover:bg-accent/10"
        >
          <AppIcon name="download" :size="14" />
          下载简历
        </a>
      </div>
    </section>

    <!-- ============ 精选项目 ============ -->
    <section id="work" class="mt-section-sm lg:mt-section">
      <SectionHeading v-reveal index="01" title="精选项目" eyebrow="Selected Work" />

      <FilterBar
        :options="filters"
        :active="activeCategory"
        class="mt-1"
        @select="selectCategory"
      />

      <!-- 揭示挂在外层、淡入淡出挂在里层：两个 transition 都改 opacity，放同一个元素上会互相覆盖 -->
      <div v-reveal="60" class="mt-7">
        <div
          class="project-grid grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3"
          :class="{ 'is-fading': isFading }"
        >
          <ProjectCard
            v-for="project in visibleProjects"
            :key="project.id"
            :project="project"
          />
        </div>

        <!-- 分类下没有项目时的兜底，删数据不会露出空白区 -->
        <p v-if="!visibleProjects.length" class="py-12 text-center text-sm text-fg-faint">
          该分类下暂时还没有项目。
        </p>
      </div>
    </section>

    <!-- ============ 能力矩阵 ============ -->
    <section id="stack" class="mt-section-sm lg:mt-section">
      <SectionHeading v-reveal index="02" title="能力矩阵" eyebrow="Capability" />

      <!-- 揭示交给 SkillMatrix 内部的每组卡片（按组递增延迟），这里不再包一层 -->
      <SkillMatrix :groups="profile.skills" />
    </section>

    <!-- ============ 关于 ============ -->
    <section id="about" class="mt-section-sm lg:mt-section">
      <SectionHeading v-reveal index="03" title="关于" eyebrow="About" />

      <p v-reveal class="max-w-content text-base leading-relaxed text-fg-muted">
        {{ profile.about }}
      </p>

      <!-- 三个项目的来历：比抽象的原则更像人话，也让面试官知道你为什么做这些 -->
      <ul class="mt-8 space-y-7">
        <li
          v-for="(item, i) in profile.history"
          :key="item.label"
          v-reveal="i * 70"
          class="border-l border-line pl-4 sm:pl-5"
        >
          <p class="font-mono text-xs text-accent">{{ item.label }}</p>
          <h3 class="mt-2 text-base font-medium text-fg">{{ item.title }}</h3>
          <p class="mt-2 max-w-content text-sm leading-relaxed text-fg-muted">{{ item.text }}</p>
        </li>
      </ul>
    </section>

    <!-- ============ 经历（时间线） ============ -->
    <section id="journey" class="mt-section-sm lg:mt-section">
      <SectionHeading v-reveal index="04" title="经历" eyebrow="Timeline" />

      <TimelineList :nodes="profile.timeline" />
    </section>

    <!-- ============ 联系 ============ -->
    <section id="contact" class="mt-section-sm lg:mt-section">
      <SectionHeading v-reveal index="05" title="联系" eyebrow="Contact" />

      <div v-reveal="60" class="mt-7">
        <ContactPanel />
      </div>
    </section>
  </div>
</template>
