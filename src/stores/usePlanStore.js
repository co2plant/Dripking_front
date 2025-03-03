import {defineStore} from 'pinia';

export const usePlanStore = defineStore('plan', {
    state: () => ({Plans:[]}),
    getters:{
    },
    actions:{
        loadPlans(){
            const savedPlans = localStorage.getItem('Plans');
            if(savedPlans!==null){
                this.Plans = JSON.parse(savedPlans);
            }
        },
        savePlans(){
            if(this.Plans.length !== 0){
                localStorage.setItem('Plans', JSON.stringify(this.Plans));
            }

        },
        addPlan(newPlan){
            if(newPlan!==null){
                this.Plans.push(newPlan);
                this.savePlans();
            }
        },
        removePlan(planId){
            this.Plans = this.Plans.filter(plan => plan.id !== planId);
        },
        sortPlans(){
            return [...this.Plans].sort((a, b) => {
                const A = a.trip_id;
                const B = b.trip_id;
                return A - B
            })
        },
        clearPlans(){
            this.Plans = [];
        }
    },
})