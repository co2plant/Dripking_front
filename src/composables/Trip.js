export default class Trip {
    constructor(id, name, description, start_date, end_date, isLocal, country) {
        this.id = id;
        this.itemType = 'TRIP';
        this.name = name;
        this.description = description;
        this.start_date = start_date;
        this.end_date = end_date;
        this.isLocal = isLocal;
        this.country = country;
    }

    setId(id) {
        this.id = id;
    }

    setItemType(itemType) {
        this.itemType = itemType;
    }

    setName(name) {
        this.name = name;
    }

    setDescription(description) {
        this.description = description;
    }

    setStartDate(start_date) {
        this.start_date = start_date;
    }

    setEndDate(end_date) {
        this.end_date = end_date;
    }

    setIsLocal(isLocal) {
        this.isLocal = isLocal;
    }

    setCountry(country) {
        this.country = country;
    }

    build(){
        return this.Trip;
    }

    getDuration() {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        return (end - start) / (1000 * 60 * 60 * 24) + 1;
    }
}