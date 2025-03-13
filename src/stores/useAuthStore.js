import { defineStore } from 'pinia';
import { useAuth } from '@/composables/useAuth';

export const useAuthStore = defineStore('auth', () => {
    const {
        user,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        getUserData,
        initAuth,
        isAuthenticated,
        userNickName,
        userEmail,
        userRole
    } = useAuth();

    return {
        user,
        isSignedIn,
        signIn,
        signUp,
        signOut,
        getUserData,
        initAuth,
        isAuthenticated,
        userNickName,
        userEmail,
        userRole
    };
});
