import './assets/main.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ContextMenu from '@imengyu/vue3-context-menu'

const app = createApp(App)

app.use(ContextMenu);
app.use(createPinia())
app.use(router)

app.mount('#app')
