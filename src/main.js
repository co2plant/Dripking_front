import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//import WhereToGo from './WhereToGo.vue'

//createApp(App).mount('#app')
createApp(App)
    .use(router)
    .mount('#whereToGo')
