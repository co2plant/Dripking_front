import { createRouter, createWebHistory } from 'vue-router'
import Landing from "@/views/Landing.vue";
import DestinationList from "@/views/DestinationList.vue";
import DistilleryList from "@/views/DistilleryList.vue";
import DistilleryDetail from "@/views/DistilleryDetail.vue";
import DestinationDetail from "@/views/DestinationDetail.vue";
import AlcoholList from "@/views/AlcoholList.vue";
import AlcoholDetail from "@/views/AlcoholDetail.vue";
import SearchedList from "@/views/SearchedList.vue";

const routes = [
    { path: '/', name: 'Home', component: Landing },
    { path: '/destinationList', name: 'DestinationList', component: DestinationList },
    { path: '/destination/:id', name: 'DestinationDetail', component: DestinationDetail },
    { path: '/distilleryList', name: 'DistilleryList', component : DistilleryList },
    { path: '/distillery/:id', name: 'DistilleryDetail', component: DistilleryDetail },
    { path: '/alcoholList', name: 'AlcoholList', component : AlcoholList },
    { path: '/alcohol/:id', name: 'AlcoholDetail', component: AlcoholDetail },
    { path: "/search/:dtype/:name", name: 'SearchList', component: SearchedList}
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router