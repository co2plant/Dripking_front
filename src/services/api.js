const API_BASE_URL = (process.env.VUE_APP_API_URL || '').replace(/\/+$/, '');

const buildUrl = (endpoint) => {
    if (/^https?:\/\//.test(endpoint)) {
        return endpoint;
    }

    return `${API_BASE_URL}/${String(endpoint).replace(/^\/+/, '')}`;
};

const parseResponseBody = async (response) => {
    const text = await response.text();
    let body = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = { message: text };
        }
    }

    if (!response.ok) {
        const error = new Error(`API request failed with status ${response.status}`);
        error.status = response.status;
        error.body = body;
        throw error;
    }

    return body;
};

export const resolveApiErrorMessage = (error, fallbackMessage = '요청을 처리하지 못했습니다.') => {
    const message = error?.message || '';
    const isNetworkError = error instanceof TypeError
        && (message.includes('Failed to fetch')
            || message.includes('NetworkError')
            || message.includes('Load failed'));

    return error?.body?.error?.message
        || error?.body?.message
        || (isNetworkError ? 'API 서버에 연결할 수 없습니다. 백엔드 실행 상태와 API 주소 설정을 확인해주세요.' : message)
        || fallbackMessage;
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

    async getWithOptionalToken(endpoint){
        const headers = {
            'Content-Type': 'application/json'
        };
        const authorization = localStorage.getItem('Authorization');
        if (authorization) {
            headers.Authorization = authorization;
        }

        const response = await fetch(buildUrl(endpoint), {headers});
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

    async postFormWithToken(endpoint, formData){
        const response = await fetch(buildUrl(endpoint), {
            method: 'POST',
            headers: {
                'Authorization' : localStorage.getItem('Authorization')
            },
            body: formData
        });
        return parseResponseBody(response);
    },

    async postWithOptionalToken(endpoint, data){
        const headers = {
            'Content-Type': 'application/json'
        };
        const authorization = localStorage.getItem('Authorization');
        if (authorization) {
            headers.Authorization = authorization;
        }

        const response = await fetch(buildUrl(endpoint), {
            method: 'POST',
            headers,
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

    async patchWithToken(endpoint, data){
        const response = await fetch(buildUrl(endpoint), {
            method: 'PATCH',
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
