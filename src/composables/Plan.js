export default class Plan{
    constructor(){
        this.id = null;
        this.itemType = 'PLAN';
        this.name = null;
        this.description = null;
        this.plan_date = null;
        this.start_time = null;
        this.end_time = null;
        this.address = null;
        this.trip_id = -1;
    }

    setId(id){
        this.id = id;
        return this;
    }

    setItemType(itemType){
        this.itemType = itemType;
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

    setAddress(address){
        this.address = address;
        return this;
    }

    setTripId(trip_id){
        this.trip_id = trip_id;
        return this;
    }

    build(){
        return this.Plan
    }
}