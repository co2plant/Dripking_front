export default class Trip {
    constructor(){
        this.id = 'T' + Date.now().toString();
        this.name = null;
        this.description = null;
        this.start_date = null;
        this.end_date = null;
        this.isLocal = true;
        this.country = null; //country name
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

    /**
     * 서버 API 요청을 위한 DTO 객체를 반환합니다.
     * @returns {{name: string, description: string, start_date: string, end_date: string}}
     */
    toRequestDTO() {
        return {
            name: this.name,
            description: this.description,
            start_date: this.start_date,
            end_date: this.end_date,
            country: this.country,
        };
    }

    /**
     * 서버에서 받은 DTO 객체를 Trip 인스턴스로 변환하는 정적 메서드입니다.
     * @param {object} dto - 서버에서 받은 데이터 전송 객체
     * @returns {Trip} 새로운 Trip 인스턴스
     */
    static fromDTO(dto) {
        const trip = new Trip(); // 새 인스턴스 생성
        trip.id = dto.id; // 서버에서 받은 ID 사용
        trip.name = dto.name;
        trip.description = dto.description;
        trip.start_date = dto.start_date;
        trip.end_date = dto.end_date;
        trip.isLocal = false; // 서버에서 왔으므로 isLocal은 false
        trip.country = dto.country_name || dto.country; // DTO 필드명 확인 (country_name 또는 country)
        // 필요한 다른 속성들도 dto에서 가져와 설정
        return trip; // 생성된 인스턴스 반환
    }
}
