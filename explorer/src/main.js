import { createApp } from "vue";
import App from "./App.vue";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import axios from "axios";
// import router from "./router"
import router from "./api/router.js";

const app = createApp(App);
app.config.globalProperties.$axios = axios;
app.use(ElementPlus);
app.use(router);
app.component("Loading", Loading);

app.mount("#app");
