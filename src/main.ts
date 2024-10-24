import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import VLoading from '@/directives/loading'

const app = createApp(App)

app.use(router)

// create custom directive for loading process
app.directive('loading', VLoading)

app.mount('#app')
