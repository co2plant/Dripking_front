import {defineStore} from 'pinia';

export const useTripStore = defineStore('trip', {
    state: () => ({trips:[]}),
    getters:{
    },
    actions:{
        loadTrips(){
            const savedTrips = localStorage.getItem('Trips');
            if(savedTrips){
                this.trips = JSON.parse(savedTrips);
            }
        },
        saveTrips(){
            localStorage.setItem('Trips', JSON.stringify(this.trips));
        },
        addTrip(newTrip){
            this.trips.push(newTrip);
            this.saveTrips();
        },
        removeTrip(tripId){
            this.trips = this.trips.filter(trip => trip.id !== tripId);
        },
        sortTrips(){
            return [...this.trips].sort((a, b) => {
                const dateA = new Date(`${a.start_date}`)
                const dateB = new Date(`${b.start_date}`)
                return dateA - dateB
            })
        },
    },
})