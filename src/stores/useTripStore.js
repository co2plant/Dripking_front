import {defineStore} from 'pinia';

export const useTripStore = defineStore('trip', {
    state: () => ({Trips:[]}),
    getters:{
    },
    actions:{
        loadTrips(){
            const savedTrips = localStorage.getItem('Trips');
            if(savedTrips!==null){
                this.Trips = JSON.parse(savedTrips);
            }
        },
        saveTrips(){
            if (this.Trips.length !== 0){
                localStorage.setItem('Trips', JSON.stringify(this.Trips));
            }

        },
        addTrip(newTrip){
            try{
                if(newTrip!==null){
                    this.Trips.push(newTrip);
                    return true;
                }
                return false;
            }catch(e){
                console.error(e);
                return false;
            }

        },
        removeTrip(tripId){
            this.Trips = this.Trips.filter(trip => trip.id !== tripId);
        },
        sortTrips(){
            return [...this.Trips].sort((a, b) => {
                const dateA = new Date(`${a.start_date}`)
                const dateB = new Date(`${b.start_date}`)
                return dateA - dateB
            })
        },
    },
})