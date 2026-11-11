/**
 * 项目分类字典
 * 职责：把 projects.json 里的英文枚举（category）翻译成页面上的中文标签，
 *       并提供筛选条用的完整选项清单。
 *
 * 为什么把标签放在这里而不是写进 JSON：
 *   1. 枚举值是给代码用的（筛选、排序、以后按类型分组），中文是给访客看的；
 *   2. 想改「客户端」这个说法时，改一处就够，不用动所有项目数据；
 *   3. JSON 里只留稳定枚举，替换真实数据时不会因为写错中文而让分类失效。
 *
 * 关于 desktop 这个键：显示名已改成「客户端」（现在的项目里有 Android 应用），
 * 键名故意不动——ProjectDetailView / ActionBar / ProjectCard 都按它分支，
 * 改键名要连带改三处判断，收益只有「名字好看」，不值得。
 */
export const categoryLabels = {
  opensource: '开源项目',
  desktop: '客户端',
  ai: 'AI 应用',
  efficiency: '效率工具',
}

/** 取中文标签；遇到没登记的枚举就退回原值，不让页面出现 undefined */
export function categoryLabel(category) {
  return categoryLabels[category] ?? category
}

/**
 * 筛选条选项：all 在最前，其余按 categoryLabels 的登记顺序。
 * 新增一个分类时，只要在 categoryLabels 里加一行，筛选条会自动多出一项。
 */
export const categoryFilters = [
  { key: 'all', label: '全部' },
  ...Object.entries(categoryLabels).map(([key, label]) => ({ key, label })),
]
