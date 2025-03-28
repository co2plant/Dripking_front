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
import TripModify from "@/views/TripModify.vue";
// import Map from  "@/components/map.vue";
import EditUserDetail from "@/views/EditUserDetail.vue"
import {Dashboard} from "@/views/Dashboard.vue";
import {UserDashboard} from "@/views/UserDashboard.vue";
import {useAuthStore} from "@/stores/useAuthStore";

const routes = [
    { path: '/', name: 'Home', component: Landing },
    { path: '/destinationList', name: 'destinationList', component: DestinationList, meta:{requiredGuest : true} },
    { path: '/destination/:id', name: 'destinationDetail', component: DestinationDetail, meta:{requiredGuest : true} },
    { path: '/distilleryList', name: 'distilleryList', component : DistilleryList, meta:{requiredGuest : true} },
    { path: '/distillery/:id', name: 'distilleryDetail', component: DistilleryDetail, meta:{requiredGuest : true} },
    { path: '/alcoholList', name: 'alcoholList', component : AlcoholList, meta:{requiredGuest : true} },
    { path: '/alcohol/:id', name: 'alcoholDetail', component: AlcoholDetail, meta:{requiredGuest : true} },
    { path: '/search/:dtype', name: 'searchList', component: SearchedList, meta:{requiredGuest : true}}, //현재는 미사용(검색기능 추가 시 사용할 예정)
    { path: '/test', name:'test', component:TestPage, meta:{requiredGuest : true}},
    { path: '/trip/:id', name:'tripModify', component: TripModify, meta:{requiredGuest : true}},
    // { path: '/map', name:'map', component: Map, meta:{requiredGuest : true}},
    { path: '/editUserDetail', name:'editUserDetail', component: EditUserDetail, meta:{requiredUser : true}},
    { path: '/dashboard', name:'dashboard', component: Dashboard},
    { path: '/userDashboard', name:'userDashboard', component: UserDashboard},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to/*, from*/) => {
    const authStore = useAuthStore();

    if(!authStore.isSignedIn && !authStore.isAuthenticated()){
        await authStore.initAuth();
    }

    if(to.meta.requiredUser && !authStore.isSignedIn){
        return {name: 'Home', query: {redirect: to.fullPath}};
    }
})

export default router