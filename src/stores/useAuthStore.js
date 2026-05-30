import { defineStore } from 'pinia';
import { useAuth } from '@/composables/useAuth';

export const useAuthStore = defineStore('auth', () => {
    const {
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
        userId,
        userNickName,
        userEmail,
        userRole,
        userRoles,
        isAdmin
    } = useAuth();

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
        userId,
        userNickName,
        userEmail,
        userRole,
        userRoles,
        isAdmin
    };
});
