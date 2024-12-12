import { createRouter, createWebHistory } from 'vue-router'

import DestinationList from "@/pages/DestinationList.vue";
import DistilleryList from "@/pages/DistilleryList.vue";
import DistilleryDetail from "@/pages/DistilleryDetail.vue";
import DestinationDetail from "@/pages/DestinationDetail.vue";

const routes = [
    { path: '/destinationList', name:'DestinationList', component: DestinationList },
    { path: '/destination/:id', name: 'DestinationDetail', component: DestinationDetail },
    { path: '/distilleryList', name: 'distilleryList', component : DistilleryList },
    { path: '/distillery/:id', name: 'DistilleryDetail', component: DistilleryDetail }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router

/*
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', component: Home }, // 루트 경로
  { path: '/about', component: About }, // /about 경로
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
 */