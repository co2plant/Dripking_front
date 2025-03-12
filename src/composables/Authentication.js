// 임시 작성
//
export async function login(signInForm){
    const response = await fetch('http://localhost:8080/api/user/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(signInForm)
    })

    if(!response.ok){
        throw new Error('로그인에 실패했습니다.')
    }

    localStorage.setItem('Authorization', response.headers.get('Authorization'))

}
export function parseJwt(token){
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

export function logout(){
    localStorage.removeItem('Authorization');
}

export function isAuthenticated(){
    const token = localStorage.getItem('Authorization');
    if(!token) return false;

    const tokenData = parseJwt(token);
    const currentTime = Date.now() / 1000;
    return tokenData.exp > currentTime;
}

export async function getUserInfo(){
    const token = localStorage.getItem('Authorization')
    const response = await fetch('http://localhost:8080/api/user/signin', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return await response.json();
}