export default class Plan{
    constructor(id, name, description, plan_date, start_time, end_time, address, trip_id){
        this.id = id;
        this.itemType = 'PLAN';
        this.name = name;
        this.description = description;
        this.plan_date = plan_date;
        this.start_time = start_time;
        this.end_time = end_time;
        this.address = address;
        this.trip_id = trip_id;
    }

    setId(id){
        this.id = id
    }

    setItemType(itemType){
        this.itemType = itemType
    }

    setName(name){
        this.name = name
    }

    setDescription(description){
        this.description = description
    }

    setPlanDate(plan_date){
        this.plan_date = plan_date
    }

    setStartTime(start_time){
        this.start_time = start_time
    }

    setEndTime(end_time) {
        this.end_time = end_time
    }

    setAddress(address){
        this.address = address
    }

    setTripId(trip_id){
        this.trip_id = trip_id
    }

    build(){
        return this.Plan
    }
}