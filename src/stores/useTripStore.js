import {defineStore} from 'pinia';
import {ref} from "vue";

export const useTripStore = defineStore('trip', () =>{
    const trips = ref([]);

    const loadTrips = () => {
        const savedTrips = localStorage.getItem('Trips');
        if(savedTrips){
            trips.value = JSON.parse(savedTrips);
        }
    }

    const saveTrips = () => {
        localStorage.setItem('Trips', JSON.stringify(trips.value));
    }

    const addTrip = (newTrip) =>{
        trips.value.push(newTrip);
        saveTrips();
    }

    const removeTrip = (tripId) => {
        trips.value = trips.value.filter(trip => trip.id !== tripId);
    }

    const sortTrips = () => {
        return [...trips.value].sort((a, b) => {
            const dateA = new Date(`${a.start_date}`)
            const dateB = new Date(`${b.start_date}`)
            return dateA - dateB
        })
    }

    return {
        trips,
        loadTrips,
        saveTrips,
        addTrip,
        removeTrip,
        sortTrips
    };
})