const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080/api';

export const apiService = {
    async get(endpoint){
        const response = await fetch(`${API_BASE_URL}/${endpoint}`)
            .then(response => response.json()
        );
        return await response;
    },

    async post(endpoint, data){
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async postWithToken(endpoint, data){
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async put(endpoint, data){
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async putWithToken(endpoint, data){
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
}