import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import PageHeader from './components/PageHeader.vue'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus, {
  locale: zhCn
})
app.use(router)
app.mount('#app')
app.component('PageHeader', PageHeader)
