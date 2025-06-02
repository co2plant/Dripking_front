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
        // place에 해당되는 컬럼들
        this.latitude = null;
        this.longitude = null;
        this.place_name = null;
        this.address = null;
        // place에 해당되는 컬럼들
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

    // place에 해당되는 컬럼들
    setLatitude(latitude){
        this.latitude = latitude;
        return this;
    }

    setLongitude(longitude){
        this.longitude = longitude;
        return this;
    }

    setPlaceName(place_name){
        this.place_name = place_name;
        return this;
    }

    setAddress(address){
        this.address = address;
        return this;
    }

    setItemType(item_type){
        this.item_type = item_type;
        return this;
    }

    build(){
        return this;
    }
}
