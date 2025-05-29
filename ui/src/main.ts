//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import 'ant-design-vue/dist/reset.css';
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)


async function enableMocking() {
    if (import.meta.env.MODE !== 'mock') {
        return
    }

    const { worker } = await import('@/mock/index')

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.

    worker.start()
    console.log('start mock')
}

enableMocking().then(() => {
    app.mount('#app')
})

