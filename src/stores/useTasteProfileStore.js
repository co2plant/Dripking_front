import { defineStore } from 'pinia';
import { apiService, resolveApiErrorMessage } from '@/services/api';

const normalizeCategoryIds = (categories) => {
    if (!Array.isArray(categories)) {
        return [];
    }
    return [...new Set(categories.map(Number).filter(Number.isFinite))];
};

const normalizeFlavorTags = (flavorTags) => {
    if (!Array.isArray(flavorTags)) {
        return [];
    }
    return [...new Set(flavorTags
        .map(tag => String(tag || '').trim().toLowerCase())
        .filter(Boolean))];
};

export const useTasteProfileStore = defineStore('tasteProfile', {
    state: () => ({
        profile: {
            categories: [],
            flavorTags: [],
            updatedAt: null,
        },
        isLoading: false,
        isSaving: false,
        errorMessage: '',
    }),
    getters: {
        selectedCategoryIds: (state) => state.profile.categories,
        selectedFlavorTags: (state) => state.profile.flavorTags,
    },
    actions: {
        async loadProfile() {
            this.isLoading = true;
            this.errorMessage = '';
            try {
                const response = await apiService.getWithToken('taste-profile');
                this.profile = {
                    categories: normalizeCategoryIds(response?.categories),
                    flavorTags: normalizeFlavorTags(response?.flavorTags),
                    updatedAt: response?.updatedAt || null,
                };
                return { success: true };
            } catch (error) {
                this.errorMessage = resolveApiErrorMessage(error, '취향 정보를 불러오지 못했습니다.');
                return { success: false, error: this.errorMessage };
            } finally {
                this.isLoading = false;
            }
        },
        async saveProfile(categories, flavorTags) {
            this.isSaving = true;
            this.errorMessage = '';
            try {
                const response = await apiService.postWithToken('taste-profile', {
                    categories: normalizeCategoryIds(categories),
                    flavorTags: normalizeFlavorTags(flavorTags),
                });
                this.profile = {
                    categories: normalizeCategoryIds(response?.categories),
                    flavorTags: normalizeFlavorTags(response?.flavorTags),
                    updatedAt: response?.updatedAt || null,
                };
                return { success: true, profile: this.profile };
            } catch (error) {
                this.errorMessage = resolveApiErrorMessage(error, '취향 정보를 저장하지 못했습니다.');
                return { success: false, error: this.errorMessage };
            } finally {
                this.isSaving = false;
            }
        },
    },
});
