import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Icon from '../src/components/icons/Icon.vue'

const app = createApp(App)

app.component('Icon', Icon)

app.use(router).mount('#app')