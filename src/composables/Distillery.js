export default class Distillery{
    constructor(id, name, address, description, img_url){
        this.id = id;
        this.itemType = 'DISTILLERY';
        this.name = name;
        this.address = address;
        this.description = description;
        this.img_url = img_url;
    }
}