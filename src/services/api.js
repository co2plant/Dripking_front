const API_BASE_URL = (process.env.VUE_APP_API_URL || '').replace(/\/+$/, '');

const buildUrl = (endpoint) => {
    if (/^https?:\/\//.test(endpoint)) {
        return endpoint;
    }

    return `${API_BASE_URL}/${String(endpoint).replace(/^\/+/, '')}`;
};

const parseResponseBody = async (response) => {
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.status = response.status;
        error.body = body;
        throw error;
    }

    return body;
};

export const apiService = {
    async get(endpoint){
        const response = await fetch(buildUrl(endpoint));
        return parseResponseBody(response);
    },

    async getWithToken(endpoint){
        const response = await fetch(buildUrl(endpoint), {
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            }
        });
        return parseResponseBody(response);
    },

    async post(endpoint, data){
        const response = await fetch(buildUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return parseResponseBody(response);
    },

    async postWithToken(endpoint, data){
        const response = await fetch(buildUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            },
            body: JSON.stringify(data)
        });
        return parseResponseBody(response);
    },

    async put(endpoint, data){
        const response = await fetch(buildUrl(endpoint), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return parseResponseBody(response);
    },

    async putWithToken(endpoint, data){
        const response = await fetch(buildUrl(endpoint), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            },
            body: JSON.stringify(data)
        });
        return parseResponseBody(response);
    },

    async delete(endpoint){
        const response = await fetch(buildUrl(endpoint), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return parseResponseBody(response);
    },

    async deleteWithToken(endpoint){
        const response = await fetch(buildUrl(endpoint), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : localStorage.getItem('Authorization')
            }
        });
        return parseResponseBody(response);
    },
}
