export default class Destination{
    constructor(){
        this.id = null;
        this.itemType = 'DESTINATION';
        this.name = null;
        this.latitude = null;
        this.longitude = null;
        this.description = null;
        this.img_url = null;
        this.plan_id = -1;
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

    setLatitude(latitude){
        this.latitude = latitude;
        return this;
    }

    setLongitude(longitude){
        this.longitude = longitude;
        return this;
    }

    setDescription(description){
        this.description = description;
        return this;
    }

    setImgUrl(img_url){
        this.img_url = img_url;
        return this;
    }

    setPlanID(plan_id){
        this.plan_id = plan_id;
        return this;
    }

    build(){
        return this.Destination;
    }
}