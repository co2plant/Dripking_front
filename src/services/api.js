const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080/api';

export const apiService = {
    async get(endpoint){
        const response = await fetch(`${API_URL}/${endpoint}`)
            .then(response => response.json()
        );
        return await response;
    },

    async post(endpoint, data){
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async postWithToken(endpoint, data){
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
}