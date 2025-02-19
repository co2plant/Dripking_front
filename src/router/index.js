import { createRouter, createWebHistory } from 'vue-router'
import Landing from "@/views/Landing.vue";
import DestinationList from "@/views/DestinationList.vue";
import DistilleryList from "@/views/DistilleryList.vue";
import DistilleryDetail from "@/views/DistilleryDetail.vue";
import DestinationDetail from "@/views/DestinationDetail.vue";
import AlcoholList from "@/views/AlcoholList.vue";
import AlcoholDetail from "@/views/AlcoholDetail.vue";
import SearchedList from "@/views/SearchedList.vue";
import TestPage from "@/views/TestPage.vue";
import EditTrip from "@/views/EditTrip.vue";

const routes = [
    { path: '/', name: 'Home', component: Landing },
    { path: '/destinationList', name: 'destinationList', component: DestinationList },
    { path: '/destination/:id', name: 'destinationDetail', component: DestinationDetail },
    { path: '/distilleryList', name: 'distilleryList', component : DistilleryList },
    { path: '/distillery/:id', name: 'distilleryDetail', component: DistilleryDetail },
    { path: '/alcoholList', name: 'alcoholList', component : AlcoholList },
    { path: '/alcohol/:id', name: 'alcoholDetail', component: AlcoholDetail },
    { path: '/search/:dtype', name: 'searchList', component: SearchedList},
    { path: '/test', name:'test', component:TestPage},
    { path: '/triptest/:id', name:'triptest', component: EditTrip},
    { path: '/maptest', name:'maptest', component: () => import('@/components/map.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router