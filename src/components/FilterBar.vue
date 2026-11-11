<script setup>
/**
 * 分类筛选条
 * 职责：一排可点的分类按钮，把当前选中项抛给父组件；自己不持有列表、不做过滤。
 *
 * 为什么用 <button> 而不是 <a>：它不改变地址栏，只切换列表内容，属于页面内状态。
 * 选中态用 aria-pressed 表达，读屏软件能听出「哪个分类正被选中」。
 */
defineProps({
  /** [{ key, label }]，第一项通常是「全部」 */
  options: { type: Array, required: true },
  /** 当前选中的 key */
  active: { type: String, required: true },
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="flex flex-wrap items-center gap-2" role="group" aria-label="按分类筛选项目">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      :aria-pressed="option.key === active"
      class="cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors duration-base ease-out-soft"
      :class="
        option.key === active
          ? 'border-accent text-accent'
          : 'border-line-subtle text-fg-faint hover:border-line-strong hover:text-fg-secondary'
      "
      @click="emit('select', option.key)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
