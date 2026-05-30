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
        this.target_id = null;
        this.item_type = null;
        this.trip_id = -1;
        this.isLocal = true;
        // place에 해당되는 컬럼들
        this.latitude = null;
        this.longitude = null;
        this.place_name = null;
        this.address = null;
        this.img_url = null;
        this.custom_place_name = null;
        this.custom_place_address = null;
        this.snapshot_name = null;
        this.snapshot_address = null;
        this.snapshot_latitude = null;
        this.snapshot_longitude = null;
        this.sort_order = null;
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
        this.target_id = place_id;
        return this;
    }

    setTargetId(target_id){
        this.target_id = target_id;
        this.place_id = target_id;
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

    setIsLocal(isLocal){
        this.isLocal = isLocal;
        return this;
    }

    build(){
        return this;
    }

    toRequestDTO(){
        const itemType = this.item_type === 'PLACE' ? 'CUSTOM_PLACE' : this.item_type;
        return {
            name: this.name,
            description: this.description,
            planDate: this.plan_date,
            startTime: this.start_time,
            endTime: this.end_time,
            itemType,
            targetId: this.target_id || this.place_id,
            customPlaceName: this.custom_place_name || this.place_name,
            customPlaceAddress: this.custom_place_address || this.address,
            sortOrder: this.sort_order,
        };
    }

    static fromDTO(dto){
        const plan = new Plan();
        plan.id = dto.id;
        plan.name = dto.name;
        plan.description = dto.description;
        plan.plan_date = Plan.normalizeDate(dto.planDate || dto.plan_date);
        plan.start_time = Plan.normalizeTime(dto.startTime || dto.start_time);
        plan.end_time = Plan.normalizeTime(dto.endTime || dto.end_time);
        plan.item_type = dto.itemType || dto.item_type;
        plan.target_id = dto.targetId || dto.target_id || dto.placeId || dto.place_id;
        plan.place_id = plan.target_id;
        plan.trip_id = dto.tripId || dto.trip_id;
        plan.custom_place_name = dto.customPlaceName || dto.custom_place_name;
        plan.custom_place_address = dto.customPlaceAddress || dto.custom_place_address;
        plan.snapshot_name = dto.snapshotName || dto.snapshot_name;
        plan.snapshot_address = dto.snapshotAddress || dto.snapshot_address;
        plan.snapshot_latitude = dto.snapshotLatitude ?? dto.snapshot_latitude ?? null;
        plan.snapshot_longitude = dto.snapshotLongitude ?? dto.snapshot_longitude ?? null;
        plan.place_name = plan.snapshot_name || plan.custom_place_name || plan.name;
        plan.address = plan.snapshot_address || plan.custom_place_address;
        plan.latitude = plan.snapshot_latitude;
        plan.longitude = plan.snapshot_longitude;
        plan.sort_order = dto.sortOrder ?? dto.sort_order ?? null;
        plan.isLocal = false;
        return plan;
    }

    static normalizeDate(value) {
        if (!value || typeof value !== 'string') return value;
        return value.includes('T') ? value.slice(0, 10) : value;
    }

    static normalizeTime(value) {
        if (!value || typeof value !== 'string') return value;
        return value.length > 5 ? value.slice(0, 5) : value;
    }
}
