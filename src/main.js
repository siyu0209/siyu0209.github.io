/**
 * 应用入口
 * 职责：创建 Vue 实例 → 注册全局指令 → 挂载路由 → 挂载到 #app。
 * 样式引入顺序不可调换：tokens 声明 @theme 与 cascade layer，
 * base 使用这些变量定元素默认值，motion 只有在前两者之后才有意义。
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import reveal from './directives/reveal'
import spotlight from './directives/spotlight'

import './styles/tokens.css'
import './styles/base.css'
import './styles/motion.css'

const app = createApp(App)

// 全局指令：滚动揭示（v-reveal）与指针辉光（v-spotlight），用法见各自文件头注释
app.directive('reveal', reveal)
app.directive('spotlight', spotlight)

app.use(router).mount('#app')
