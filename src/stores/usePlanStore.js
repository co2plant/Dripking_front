import {defineStore} from 'pinia';
import {computed, ref} from 'vue';

export const usePlanStore = defineStore('plan', () =>{
    const Plans = ref([]);

    const loadPlans = () => {
        const savedPlans = localStorage.getItem('Plans');
        if(savedPlans){
            Plans.value = JSON.parse(savedPlans);
        }
    }

    const savePlans = () =>{
        localStorage.setItem('Plans', JSON.stringify(Plans.value));
    }

    const addPlan = (newPlan) => {
        Plans.value.push(newPlan);
        savePlans();
    }

    const removePlan = (planId) => {
        Plans.value = Plans.value.filter(plan => plan.id !== planId);
    }

    const sortPlans = computed( () => {
        return [...Plans.value].sort((a, b) => {
            const A = a.trip_id;
            const B = b.trip_id;
            return A - B
        })
    })

    return {
        Plans,
        loadPlans,
        savePlans,
        addPlan,
        removePlan,
        sortPlans
    };
})