import { createRouter, createWebHistory } from 'vue-router'
import Landing from "@/views/Landing.vue";
import DestinationList from "@/views/DestinationList.vue";
import DistilleryList from "@/views/DistilleryList.vue";
import DistilleryDetail from "@/views/DistilleryDetail.vue";
import DestinationDetail from "@/views/DestinationDetail.vue";

const routes = [
    { path: '/', name: 'Landing', component: Landing },
    { path: '/destinationList', name: 'DestinationList', component: DestinationList },
    { path: '/destination/:id', name: 'DestinationDetail', component: DestinationDetail },
    { path: '/distilleryList', name: 'distilleryList', component : DistilleryList },
    { path: '/distillery/:id', name: 'DistilleryDetail', component: DistilleryDetail }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router