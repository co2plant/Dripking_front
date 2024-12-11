import { createRouter, createWebHistory } from 'vue-router'
import Destination from '../components/Destination.vue'
import Distilleries from '../components/Distilleries.vue'

const routes = [
    { path: '/', component: Destination },
    { path: '/distillery/:id', name: 'DistilleryDetail', component: Distilleries }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router