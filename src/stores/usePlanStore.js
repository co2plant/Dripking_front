import {defineStore} from 'pinia';
import Plan from "@/composables/Entity/Plan";
import {apiService} from "@/services/api";
import {useAuthStore} from "@/stores/useAuthStore";

export const usePlanStore = defineStore('plan', {
    state: () => ({
        Plans:[],
        isLoading: false,
    }),
    getters:{
    },
    actions:{
        _loadPlansFromLocal(){
            const savedPlans = localStorage.getItem('Plans');
            if(savedPlans!==null){
                this.Plans = JSON.parse(savedPlans);
            }
        },
        async loadPlans(tripId = null){
            const authStore = useAuthStore();
            if(authStore.isAuthenticated() && tripId !== null){
                await this.loadPlansFromServer(tripId);
                return;
            }
            this._loadPlansFromLocal();
        },
        async loadPlansFromServer(tripId){
            this.isLoading = true;
            try {
                const response = await apiService.getWithToken(`trips/${tripId}/plans`);
                const serverPlans = Array.isArray(response) ? response.map(dto => Plan.fromDTO(dto)) : [];
                this.Plans = [
                    ...this.Plans.filter(plan => String(plan.trip_id) !== String(tripId)),
                    ...serverPlans
                ];
            } catch (error) {
                console.error(`Error loading plans for trip ${tripId}:`, error);
                this._loadPlansFromLocal();
            } finally {
                this.isLoading = false;
            }
        },
        savePlans(){
            const localPlans = this.Plans.filter(plan => plan.isLocal !== false);
            localStorage.setItem('Plans', JSON.stringify(localPlans));
        },
        async addPlan(newPlan){
            if(newPlan!==null){
                const plan = Object.assign(new Plan(), newPlan);
                const authStore = useAuthStore();
                if(authStore.isAuthenticated() && plan.trip_id !== -1){
                    try {
                        const createdPlan = Plan.fromDTO(await apiService.postWithToken(`trips/${plan.trip_id}/plans`, plan.toRequestDTO()));
                        this.Plans.push(createdPlan);
                        return createdPlan;
                    } catch (error) {
                        console.error("Error adding plan to server:", error);
                        return null;
                    }
                }

                plan.isLocal = true;
                this.Plans.push(plan);
                this.savePlans();
                return plan;
            }
            return null;
        },
        async updatePlan(planId, updatedPlan){
            const planIndex = this.Plans.findIndex(plan => String(plan.id) === String(planId));
            if(planIndex === -1) return null;

            const plan = Object.assign(new Plan(), this.Plans[planIndex], updatedPlan);
            const authStore = useAuthStore();
            if(authStore.isAuthenticated() && plan.isLocal === false){
                try {
                    const savedPlan = Plan.fromDTO(await apiService.putWithToken(`trips/${plan.trip_id}/plans/${plan.id}`, plan.toRequestDTO()));
                    this.Plans[planIndex] = savedPlan;
                    return savedPlan;
                } catch (error) {
                    console.error(`Error updating plan ${planId}:`, error);
                    return null;
                }
            }

            this.Plans[planIndex] = plan;
            this.savePlans();
            return plan;
        },
        async removePlan(planId){
            const plan = this.Plans.find(item => String(item.id) === String(planId));
            const authStore = useAuthStore();
            if(plan && authStore.isAuthenticated() && plan.isLocal === false){
                try {
                    await apiService.deleteWithToken(`trips/${plan.trip_id}/plans/${plan.id}`);
                } catch (error) {
                    console.error(`Error deleting plan ${planId}:`, error);
                    return false;
                }
            }
            this.Plans = this.Plans.filter(plan => plan.id !== planId);
            this.savePlans();
            return true;
        },
        sortPlans(){
            return [...this.Plans].sort((a, b) => {
                const A = a.trip_id;
                const B = b.trip_id;
                return A - B
            })
        },
        async clearPlansByTripId(tripId){
            const plansToRemove = this.Plans.filter(plan => String(plan.trip_id) === String(tripId));
            for (const plan of plansToRemove) {
                await this.removePlan(plan.id);
            }
        }
    },
})
