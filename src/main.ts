import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia'
import clipboard from "./clipboard";
import 'src/style/font-family/font.css'
import 'animate.css'
import 'amfe-flexible/index.js'
const pinia = createPinia()
createApp(App).use(pinia).use(clipboard).use(router).mount('#app')
