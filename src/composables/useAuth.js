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

    /**
     * 사용자 로그인 처리
     */
    const signIn = async (signInForm) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signInForm)
            });

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
                success: false
            };
        }
    };

    /**
     * 사용자 회원가입 처리
     */
    const signUp = async (signUpForm) => {
        try{
            const response = await fetch(`${API_BASE_URL}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signUpForm)
            });

            if (!response.ok){
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || '회원가입에 실패했습니다.');
            }

            return { success : true};
        }catch(err){
            console.error('Sign up error:', err);
            return {
                success: false
            }
        }

    }


    /**
     * 사용자 로그아웃 처리
     */
    const signOut = () => {
        localStorage.removeItem('Authorization');
        isSignedIn.value = false;
        Object.keys(user).forEach(key => delete user[key]);
    };

    /**
     * 사용자 정보 가져오기
     */
    const getUserData = async () => {
        try {
            const token = localStorage.getItem('Authorization');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

            const response = await fetch(`${API_BASE_URL}/user/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                }
            });

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
                success: false
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