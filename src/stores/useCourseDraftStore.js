import {defineStore} from 'pinia';

const MAX_COURSE_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateInput = (value) => {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
        return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return null;
    }
    return date;
};

const countInclusiveDays = (startDate, endDate) => {
    const start = parseDateInput(startDate);
    const end = parseDateInput(endDate);
    if (!start || !end) {
        return 0;
    }
    return Math.floor((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY) + 1;
};

const normalizeNumberIds = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }
    return [...new Set(values.map(Number).filter(Number.isFinite))];
};

const normalizeFlavorTags = (values) => {
    if (!Array.isArray(values)) {
        return [];
    }
    return [...new Set(values
        .map(value => String(value || '').trim().toLowerCase())
        .filter(Boolean))];
};

const defaultDraft = () => {
    const today = formatDateInput(new Date());
    return {
        startDate: today,
        endDate: today,
        countryId: 0,
        countryName: '',
        regionHint: '',
        categories: [],
        flavorTags: [],
        wishlistItemIds: [],
        captchaToken: '',
    };
};

export const useCourseDraftStore = defineStore('courseDraft', {
    state: () => ({
        draft: defaultDraft(),
        validationErrors: [],
        preparedPayload: null,
        lastPreparedAt: null,
    }),
    getters: {
        durationDays: (state) => countInclusiveDays(state.draft.startDate, state.draft.endDate),
        selectedSignalCount: (state) => (
            state.draft.categories.length
            + state.draft.flavorTags.length
            + state.draft.wishlistItemIds.length
        ),
    },
    actions: {
        clearPreparedPayload() {
            this.preparedPayload = null;
            this.lastPreparedAt = null;
        },
        resetDraft(overrides = {}) {
            this.draft = {
                ...defaultDraft(),
                ...overrides,
                categories: normalizeNumberIds(overrides.categories),
                flavorTags: normalizeFlavorTags(overrides.flavorTags),
                wishlistItemIds: normalizeNumberIds(overrides.wishlistItemIds),
            };
            this.validationErrors = [];
            this.clearPreparedPayload();
        },
        setCountry(country) {
            this.draft.countryId = Number(country?.id) || 0;
            this.draft.countryName = country?.name || '';
            this.clearPreparedPayload();
        },
        setTaste(categories, flavorTags) {
            this.draft.categories = normalizeNumberIds(categories);
            this.draft.flavorTags = normalizeFlavorTags(flavorTags);
            this.clearPreparedPayload();
        },
        setWishlistItemIds(wishlistItemIds) {
            this.draft.wishlistItemIds = normalizeNumberIds(wishlistItemIds);
            this.clearPreparedPayload();
        },
        toggleCategory(categoryId) {
            const normalizedId = Number(categoryId);
            if (!Number.isFinite(normalizedId)) {
                return;
            }

            if (this.draft.categories.includes(normalizedId)) {
                this.draft.categories = this.draft.categories.filter(id => id !== normalizedId);
            } else {
                this.draft.categories = [...this.draft.categories, normalizedId];
            }
            this.clearPreparedPayload();
        },
        toggleFlavorTag(tag) {
            const normalizedTag = String(tag || '').trim().toLowerCase();
            if (!normalizedTag) {
                return;
            }

            if (this.draft.flavorTags.includes(normalizedTag)) {
                this.draft.flavorTags = this.draft.flavorTags.filter(value => value !== normalizedTag);
            } else {
                this.draft.flavorTags = [...this.draft.flavorTags, normalizedTag];
            }
            this.clearPreparedPayload();
        },
        toggleWishlistItem(wishlistItemId) {
            const normalizedId = Number(wishlistItemId);
            if (!Number.isFinite(normalizedId)) {
                return;
            }

            if (this.draft.wishlistItemIds.includes(normalizedId)) {
                this.draft.wishlistItemIds = this.draft.wishlistItemIds.filter(id => id !== normalizedId);
            } else {
                this.draft.wishlistItemIds = [...this.draft.wishlistItemIds, normalizedId];
            }
            this.clearPreparedPayload();
        },
        validateDraft(today = formatDateInput(new Date())) {
            const errors = [];
            const startDate = parseDateInput(this.draft.startDate);
            const endDate = parseDateInput(this.draft.endDate);

            if (!startDate || !endDate) {
                errors.push('여행 날짜를 입력해주세요.');
            } else {
                if (this.draft.startDate < today || this.draft.endDate < today) {
                    errors.push('오늘 이후의 날짜를 선택해주세요.');
                }
                if (this.draft.startDate > this.draft.endDate) {
                    errors.push('출발일이 도착일보다 늦을 수 없습니다.');
                }

                const durationDays = countInclusiveDays(this.draft.startDate, this.draft.endDate);
                if (durationDays < 1 || durationDays > MAX_COURSE_DAYS) {
                    errors.push(`코스 기간은 1일부터 ${MAX_COURSE_DAYS}일까지 선택할 수 있습니다.`);
                }
            }

            if (!this.draft.countryName.trim()) {
                errors.push('국가를 선택해주세요.');
            }

            if (this.selectedSignalCount === 0) {
                errors.push('취향 또는 위시리스트 항목을 하나 이상 선택해주세요.');
            }

            this.validationErrors = errors;
            return errors;
        },
        buildGenerateRequest() {
            const payload = {
                startDate: this.draft.startDate,
                endDate: this.draft.endDate,
                countryName: this.draft.countryName.trim(),
                taste: {
                    categories: normalizeNumberIds(this.draft.categories),
                    flavorTags: normalizeFlavorTags(this.draft.flavorTags),
                },
                wishlistItemIds: normalizeNumberIds(this.draft.wishlistItemIds),
            };

            const regionHint = this.draft.regionHint.trim();
            if (regionHint) {
                payload.regionHint = regionHint;
            }

            const captchaToken = this.draft.captchaToken.trim();
            if (captchaToken) {
                payload.captchaToken = captchaToken;
            }

            return payload;
        },
        prepareGenerateRequest() {
            const errors = this.validateDraft();
            if (errors.length > 0) {
                this.preparedPayload = null;
                this.lastPreparedAt = null;
                return {success: false, errors};
            }

            const payload = this.buildGenerateRequest();
            this.preparedPayload = payload;
            this.lastPreparedAt = new Date().toISOString();
            return {success: true, payload};
        },
    },
});
