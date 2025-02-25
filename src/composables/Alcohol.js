export default class Alcohol{
    constructor(){
        this.id = null;
        this.itemType = 'ALCOHOL';
        this.name = null;
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

    setDescription(description){
        this.description = description;
        return this;
    }

    setImgUrl(img_url){
        this.img_url = img_url;
        return this;
    }

    setPlanId(plan_id){
        this.plan_id = plan_id;
        return this;
    }

    build(){
        return this.Alcohol;
    }

    toObject(jsonAlcohol){
        return new Alcohol()
            .setId(jsonAlcohol.id)
            .setDescription(jsonAlcohol.description)
            .setName(jsonAlcohol.name)
            .setImgUrl(jsonAlcohol.img_url)
            .setPlanId(jsonAlcohol.plan_id)
            .build();
    }
}