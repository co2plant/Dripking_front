import { v4 as uuidv4 } from 'uuid';

export default class Plan{
    constructor(){
        this.id = uuidv4();
        this.name = null;
        this.description = null;
        this.plan_date = null;
        this.start_time = null;
        this.end_time = null;
        this.place_id = null;
        this.item_type = null;
        this.trip_id = -1;
    }

    setId(id){
        this.id = id;
        return this;
    }

    setName(name){
        this.name = name;
        return this;
    }

    setDescription(description){
        this.description = description;
        return this;
    }

    setPlanDate(plan_date){
        this.plan_date = plan_date;
        return this;
    }

    setStartTime(start_time){
        this.start_time = start_time;
        return this;
    }

    setEndTime(end_time) {
        this.end_time = end_time;
        return this;
    }

    setPlaceId(place_id){
        this.place_id = place_id;
        return this;
    }

    setTripId(trip_id){
        this.trip_id = trip_id;
        return this;
    }

    build(){
        return this;
    }
}
