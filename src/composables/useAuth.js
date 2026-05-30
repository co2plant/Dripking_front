import { ref, reactive, computed } from 'vue';
import { useWishStore } from '@/stores/useWishStore';

// API 엔드포인트 상수 정의
const API_BASE_URL = process.env.VUE_APP_API_URL;

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
            const result = await getUserData();
            if (!result.success) {
                signOut();
            }
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

            const userDataResult = await getUserData();
            if (!userDataResult.success) {
                return { success: false, error: userDataResult.error };
            }
            await useWishStore().syncLocalWishlistToServer();
            const { useTripStore } = await import('@/stores/useTripStore');
            await useTripStore().syncLocalTripsAndPlansToServer();

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
                return {
                    success: false,
                    error: errorData.message || '회원가입에 실패했습니다.',
                    fieldErrors: errorData.fieldErrors || {}
                };
            }

            return { success : true};
        }catch(err){
            console.error('Sign up error:', err);
            return {
                success: false, error: err.message, fieldErrors: {}
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

    const updateProfile = async (profileForm) => {
        const nickname = profileForm.nickname?.trim();
        if (!nickname) {
            return { success: false, error: '닉네임을 입력해주세요.' };
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/user/profile`,
                createRequestConfig('PATCH', true, { nickname })
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const fieldErrors = errorData.fieldErrors || {};
                const firstFieldError = Object.values(fieldErrors)[0];
                throw new Error(firstFieldError || errorData.message || errorData.error || '프로필 수정에 실패했습니다.');
            }

            const profileStatus = await response.json();
            const userData = profileStatus.data || {};
            Object.assign(user, userData);
            return { success: true, data: userData };
        } catch (err) {
            console.error('Profile update error:', err);
            return {
                success: false, error: err.message
            };
        }
    };


    const changePassword = async (passwordForm) => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            return { success: false, error: '비밀번호 정보를 모두 입력해주세요.' };
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return { success: false, error: '새 비밀번호가 일치하지 않습니다.' };
        }
        if (passwordForm.newPassword.length < 16 || passwordForm.newPassword.length > 32) {
            return { success: false, error: '비밀번호는 16자 이상 32자 이하이어야 합니다.' };
        }

        try{
            const response = await fetch(
                `${API_BASE_URL}/user/changePassword`, 
                createRequestConfig('POST', true, passwordForm)
            );

            if(!response.ok){
                const errorData = await response.json().catch(() => ({}));
                const fieldErrors = errorData.fieldErrors || {};
                const firstFieldError = Object.values(fieldErrors)[0];
                throw new Error(firstFieldError || errorData.message || errorData.error || '비밀번호 변경에 실패했습니다.');
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

            const userStatus = await response.json();
            if (!userStatus.success) {
                signOut();
                return {
                    success: false,
                    error: userStatus.message || '사용자가 인증되지 않았습니다.'
                };
            }

            const userData = userStatus.data || {};

            // 반응형 객체 업데이트
            Object.assign(user, userData);

            return { success: true, data: userData };
        } catch (err) {
            console.error('Getting user info error:', err);
            signOut();
            return {
                success: false, error: err.message
            };
        }
    };

    // 유저 정보에서 가져올 수 있는 계산된 속성들
    const userId = computed(() => user.id || null);
    const userNickName = computed(() => user.nickname || '');
    const userEmail = computed(() => user.email || '');
    const userRoles = computed(() => Array.isArray(user.roles) ? user.roles : user.roles ? [user.roles.authority || user.roles] : []);
    const userRole = computed(() => Array.isArray(user.roles) ? user.roles[0] || '' : user.roles?.authority || '');
    const isAdmin = computed(() => userRoles.value.includes('ROLE_ADMIN'));

    return {
        user,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        updateProfile,
        changePassword,
        getUserData,
        initAuth,
        isAuthenticated,
        parseJwt,
        // 계산된 속성들
        userId,
        userNickName,
        userEmail,
        userRole,
        userRoles,
        isAdmin
    };
}
