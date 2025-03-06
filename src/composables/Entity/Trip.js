export default class Trip {
    constructor(){
        this.id = 'T' + Date.now().toString();
        this.name = null;
        this.description = null;
        this.start_date = null;
        this.end_date = null;
        this.isLocal = true;
        this.country = null;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setDescription(description) {
        this.description = description;
        return this;
    }

    setStartDate(start_date) {
        this.start_date = start_date;
        return this;
    }

    setEndDate(end_date) {
        this.end_date = end_date;
        return this;
    }

    setIsLocal(isLocal) {
        this.isLocal = isLocal;
        return this;
    }

    setCountry(country) {
        this.country = country;
        return this;
    }

    build(){
        return this;
    }

    getDuration() {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        return (end - start) / (1000 * 60 * 60 * 24) + 1;
    }
}