import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import router from './api/router'


const app = createApp(App);
app.config.globalProperties.$axios = axios
app.use(ElementPlus)
app.mount('#app')
app.use(router)


