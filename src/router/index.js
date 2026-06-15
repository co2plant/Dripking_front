import { createRouter, createWebHistory } from 'vue-router'
import Landing from "@/views/Landing.vue";
import DestinationList from "@/views/DestinationList.vue";
import DistilleryList from "@/views/DistilleryList.vue";
import DistilleryDetail from "@/views/DistilleryDetail.vue";
import DestinationDetail from "@/views/DestinationDetail.vue";
import AlcoholList from "@/views/AlcoholList.vue";
import AlcoholDetail from "@/views/AlcoholDetail.vue";
import SearchedList from "@/views/SearchedList.vue";
import TripCreate from "@/views/TripCreate.vue";
import TripModify from "@/views/TripModify.vue";
import TripNearby from "@/views/TripNearby.vue";
import EditUserDetail from "@/views/EditUserDetail.vue"
import Dashboard from "@/views/admin/Dashboard.vue";
import UserDashboard from "@/views/admin/UserDashboard.vue";
import ProductsFormView from "@/views/admin/ProductsFormView.vue";
import DestinationDashboard from '@/views/admin/DestinationDashboard.vue';
import ReviewModeration from '@/views/admin/ReviewModeration.vue';
import CategoryDashboard from '@/views/admin/CategoryDashboard.vue';
import Unauthorized from "@/views/Unauthorized.vue";
import NotFound from "@/views/NotFound.vue";

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
    { path: '/trips/new', name:'tripCreate', component: TripCreate, meta:{requiredGuest : true}},
    { path: '/trip/:id', name:'tripModify', component: TripModify, meta:{requiredGuest : true}, props:true},
    { path: '/trip/:id/nearby', name:'tripNearby', component: TripNearby, meta:{requiredGuest : true}, props:true},
    { path: '/editUserDetail', name:'editUserDetail', component: EditUserDetail, meta:{requiredUser : true}},
    { path: '/dashboard', name:'dashboard', component: Dashboard, meta:{requiredAdmin : true}},
    { path: '/userDashboard', name:'userDashboard', component: UserDashboard, meta:{requiredAdmin : true}},
    { path: '/destinationDashboard', name:'destinationDashboard', component: DestinationDashboard, meta:{requiredAdmin : true}},
    { path: '/categoryDashboard', name:'categoryDashboard', component: CategoryDashboard, meta:{requiredAdmin : true}},
    { path: '/reviewModeration', name:'reviewModeration', component: ReviewModeration, meta:{requiredAdmin : true}},
    { path: '/productsFormView', name:'productsFormView', component: ProductsFormView, meta:{requiredAdmin : true}},
    { path: '/unauthorized', name:'unauthorized', component: Unauthorized },
    { path: '/:pathMatch(.*)*', name:'notFound', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to/*, from*/) => {
    const authStore = useAuthStore();

    if(to.meta.requiredAdmin || to.meta.requiredUser || !authStore.isSignedIn){
        await authStore.initAuth();
    }

    if(to.meta.requiredAdmin){
        if(!authStore.isAuthenticated()){
            return {name: 'unauthorized', query: {reason: 'login', redirect: to.fullPath}};
        }
        if(!authStore.isAdmin){
            return {name: 'unauthorized', query: {reason: 'admin'}};
        }
    }

    if(to.meta.requiredUser && !authStore.isAuthenticated()){
        return {name: 'unauthorized', query: {reason: 'login', redirect: to.fullPath}};
    }
})

export default router
