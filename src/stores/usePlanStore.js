import {defineStore} from 'pinia';
import {ref} from 'vue';

export const usePlanStore = defineStore('plan', () =>{
    const plans = ref([]);

    const loadPlans = () => {
        const savedPlans = localStorage.getItem('Plans');
        if(savedPlans){
            plans.value = JSON.parse(savedPlans);
        }
    }

    const savePlans = () =>{
        localStorage.setItem('Plans', JSON.stringify(plans.value));
    }

    const addPlan = (newPlan) => {
        plans.value.push(newPlan);
        savePlans();
    }

    const removePlan = (planId) => {
        plans.value = plans.value.filter(plan => plan.id !== planId);
    }

    return { plans, loadPlans, savePlans, addPlan, removePlan };
})