import { ref, reactive, computed } from 'vue';

// API 엔드포인트 상수 정의
const API_BASE_URL = 'http://localhost:8080/api';

export function useAuth() {
    const user = reactive({});
    const isSignedIn = ref(false);

    /**
     * JWT 토큰 디코딩
     */
    const parseJwt = (token) => {
        try {
            if (!token || token.split('.').length !== 3) {
                return null;
            }

            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (err) {
            console.error('Token parsing error:', err);
            return null;
        }
    };

    /**
     * 사용자 인증 상태 확인
     */
    const isAuthenticated = () => {
        try {
            const token = localStorage.getItem('Authorization');
            if (!token) return false;

            const tokenData = parseJwt(token);
            if (!tokenData) return false;

            const currentTime = Date.now() / 1000;
            return tokenData.exp > currentTime;
        } catch (err) {
            console.error('Authentication check error:', err);
            return false;
        }
    };

    /**
     * 로그인 상태 초기화 (앱 시작 시 호출)
     */
    const initAuth = async () => {
        isSignedIn.value = isAuthenticated();

        if (isSignedIn.value) {
            await getUserData();
        }
    };

    const createRequestConfig = (method, includeAuth = true, body = null) => {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        };

        if(includeAuth){
            const token = localStorage.getItem('Authorization');
            if(token){
                config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            }
        }

        if(body){
            config.body = JSON.stringify(body);
        }
        return config;
    };

    /**
     * 사용자 로그인 처리
     */
    const signIn = async (signInForm) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/user/signin`, 
                createRequestConfig('POST', false, signInForm)
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '로그인에 실패했습니다.');
            }

            const authToken = response.headers.get('Authorization');
            if (!authToken) {
                throw new Error('인증 토큰을 받지 못했습니다.');
            }

            localStorage.setItem('Authorization', authToken);
            isSignedIn.value = true;

            await getUserData();

            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false, error: err.message
            };
        }
    };

    /**
     * 사용자 회원가입 처리
     */
    const signUp = async (signUpForm) => {
        try{
            const response = await fetch(
                `${API_BASE_URL}/user/signup`, 
                createRequestConfig('POST', false, signUpForm)
            );

            if (!response.ok){
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '회원가입에 실패했습니다.');
            }

            return { success : true};
        }catch(err){
            console.error('Sign up error:', err);
            return {
                success: false, error: err.message
            }
        }

    };

    /**
     * 사용자 로그아웃 처리
     */
    const signOut = () => {
        localStorage.removeItem('Authorization');
        isSignedIn.value = false;
        Object.keys(user).forEach(key => delete user[key]);
    };


    const changePassword = async (passwordForm) => {
        // 폼에 있는 것들이 맞는지 확인
        // 현재 비밀번호가 맞는지 확인
        if(this.passwordForm.newPassword === passwordForm.confirmPassword){
            throw new Error('새 비밀번호가 일치하지 않습니다.');
        }
        try{
            const response = await fetch(
                `${API_BASE_URL}/user/changePassword`, 
                createRequestConfig('POST', true, passwordForm)
            );

            if(!response.ok){
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '비밀번호 변경에 실패했습니다.');
            }

            return { success: true};
        }catch(err){
            console.error('Change password error:', err);
            return {
                success: false, error: err.message
            }
        }
        
    }

    /**
     * 사용자 정보 가져오기
     */
    const getUserData = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/user/status`, 
                createRequestConfig('GET', true)
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '사용자 정보를 가져오는데 실패했습니다.');
            }

            const userData = await response.json();

            // 반응형 객체 업데이트
            Object.assign(user, userData);

            return { success: true, data: userData };
        } catch (err) {
            console.error('Getting user info error:', err);
            return {
                success: false, error: err.message
            };
        }
    };

    // 유저 정보에서 가져올 수 있는 계산된 속성들
    const userNickName = computed(() => user.nickname || '');
    const userEmail = computed(() => user.email || '');
    const userRole = computed(() => user.roles.authority || '');

    return {
        user,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        changePassword,
        getUserData,
        initAuth,
        isAuthenticated,
        parseJwt,
        // 계산된 속성들
        userNickName,
        userEmail,
        userRole
    };
}