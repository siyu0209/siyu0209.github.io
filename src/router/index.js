/**
 * 路由表
 * 职责：声明 URL 与页面组件的映射关系、滚动行为。
 * 约定：页面级组件放 src/views/，一律懒加载（首屏只加载首页，详情页按需拉取）。
 * 标题与描述不写在这里——统一由 @/utils/seo.js 按路由计算，避免两个来源抢 document.title。
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { applySeo, resolveSeo } from '@/utils/seo.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    // 懒加载：详情页代码不进首包
    component: () => import('@/views/ProjectDetailView.vue'),
    // props: true 让组件用 props 接收 :id，而不是到处写 route.params
    props: true,
  },
]

const router = createRouter({
  // 静态站用 HTML5 History 模式，URL 干净；部署时需服务端把 404 回落到 index.html
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  /**
   * 前进后退恢复原位置；带 hash 时滚到锚点（详情页「返回项目列表」跳 /#work 要靠它）；
   * 其余情况回顶部，避免打开详情页停在页面中部。
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // top: 24 给吸顶留出余量，标题不会紧贴视口上沿
    if (to.hash) return { el: to.hash, top: 24 }
    return { top: 0 }
  },
})

// 每次导航后同步标题 / 描述 / Open Graph / canonical
router.afterEach((to) => {
  applySeo(resolveSeo(to))
})

export default router
