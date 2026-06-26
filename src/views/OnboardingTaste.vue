<template>
  <main class="mx-auto max-w-6xl px-4 py-8 text-left">
    <section class="mb-8 border-b border-zinc-200 pb-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-semibold text-amber-600">Taste Profile</p>
          <h1 class="mt-2 text-3xl font-bold text-zinc-950">취향 설정</h1>
          <p class="mt-2 text-sm text-zinc-600">좋아하는 주류와 맛을 골라주세요.</p>
        </div>
        <router-link
            :to="{ name: 'courseCreate' }"
            class="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          AI 코스 만들기
        </router-link>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm" @submit.prevent="saveProfile">
        <fieldset>
          <legend class="text-base font-bold text-zinc-950">주류 카테고리</legend>
          <div v-if="isLoadingCategories" class="mt-4 rounded-md bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            카테고리를 불러오는 중입니다.
          </div>
          <div v-else-if="categories.length === 0" class="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            표시할 카테고리가 없습니다.
          </div>
          <div v-else class="mt-4 grid gap-3 sm:grid-cols-2">
            <button
                v-for="category in categories"
                :key="category.id"
                type="button"
                class="flex min-h-20 items-start justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors"
                :class="isCategorySelected(category.id) ? 'border-amber-400 bg-amber-50 text-zinc-950' : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-300'"
                @click="toggleCategory(category.id)"
            >
              <span>
                <span class="block text-sm font-semibold">{{ category.name }}</span>
                <span class="mt-1 line-clamp-2 block text-xs text-zinc-500">{{ category.description || '설명 없음' }}</span>
              </span>
              <check-icon v-if="isCategorySelected(category.id)" class="h-5 w-5 shrink-0 text-amber-600" />
            </button>
          </div>
        </fieldset>

        <fieldset class="mt-8">
          <legend class="text-base font-bold text-zinc-950">맛 태그</legend>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
                v-for="tag in flavorTagOptions"
                :key="tag.value"
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
                :class="isFlavorTagSelected(tag.value) ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'"
                @click="toggleFlavorTag(tag.value)"
            >
              <check-icon v-if="isFlavorTagSelected(tag.value)" class="h-4 w-4" />
              {{ tag.label }}
            </button>
          </div>
        </fieldset>

        <p v-if="feedbackMessage" class="mt-6 rounded-md border px-4 py-3 text-sm font-medium" :class="feedbackClass">
          {{ feedbackMessage }}
        </p>

        <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              @click="resetSelection"
          >
            <rotate-ccw-icon class="h-4 w-4" />
            초기화
          </button>
          <button
              type="submit"
              :disabled="tasteProfileStore.isSaving || isLoadingCategories"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            <save-icon class="h-4 w-4" />
            {{ tasteProfileStore.isSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </form>

      <aside class="rounded-md border border-zinc-200 bg-zinc-50 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-zinc-950">선택 요약</h2>
          <span class="rounded bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
            {{ selectedCount }}
          </span>
        </div>
        <div class="mt-5 space-y-5">
          <div>
            <p class="text-xs font-semibold uppercase text-zinc-500">Categories</p>
            <div v-if="selectedCategoryNames.length" class="mt-2 flex flex-wrap gap-2">
              <span v-for="name in selectedCategoryNames" :key="name" class="rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700">
                {{ name }}
              </span>
            </div>
            <p v-else class="mt-2 text-sm text-zinc-500">선택 없음</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase text-zinc-500">Flavor</p>
            <div v-if="selectedFlavorLabels.length" class="mt-2 flex flex-wrap gap-2">
              <span v-for="label in selectedFlavorLabels" :key="label" class="rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700">
                {{ label }}
              </span>
            </div>
            <p v-else class="mt-2 text-sm text-zinc-500">선택 없음</p>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {Check as CheckIcon, RotateCcw as RotateCcwIcon, Save as SaveIcon} from 'lucide-vue-next';
import {apiService, resolveApiErrorMessage} from '@/services/api';
import {FLAVOR_TAG_OPTIONS} from '@/constants/tasteOptions';
import {useTasteProfileStore} from '@/stores/useTasteProfileStore';

const router = useRouter();
const tasteProfileStore = useTasteProfileStore();
const categories = ref([]);
const selectedCategories = ref([]);
const selectedFlavorTags = ref([]);
const isLoadingCategories = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref('idle');

const flavorTagOptions = FLAVOR_TAG_OPTIONS;

const selectedCount = computed(() => selectedCategories.value.length + selectedFlavorTags.value.length);

const selectedCategoryNames = computed(() => categories.value
    .filter(category => selectedCategories.value.includes(Number(category.id)))
    .map(category => category.name));

const selectedFlavorLabels = computed(() => flavorTagOptions
    .filter(tag => selectedFlavorTags.value.includes(tag.value))
    .map(tag => tag.label));

const feedbackClass = computed(() => {
  if (feedbackType.value === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  return 'border-red-200 bg-red-50 text-red-700';
});

const isCategorySelected = (categoryId) => selectedCategories.value.includes(Number(categoryId));

const isFlavorTagSelected = (tag) => selectedFlavorTags.value.includes(tag);

const toggleCategory = (categoryId) => {
  const normalizedCategoryId = Number(categoryId);
  if (isCategorySelected(normalizedCategoryId)) {
    selectedCategories.value = selectedCategories.value.filter(id => id !== normalizedCategoryId);
    return;
  }
  selectedCategories.value = [...selectedCategories.value, normalizedCategoryId];
};

const toggleFlavorTag = (tag) => {
  if (isFlavorTagSelected(tag)) {
    selectedFlavorTags.value = selectedFlavorTags.value.filter(value => value !== tag);
    return;
  }
  selectedFlavorTags.value = [...selectedFlavorTags.value, tag];
};

const resetSelection = () => {
  selectedCategories.value = [];
  selectedFlavorTags.value = [];
  feedbackMessage.value = '';
  feedbackType.value = 'idle';
};

const applyProfileSelection = () => {
  selectedCategories.value = [...tasteProfileStore.profile.categories];
  selectedFlavorTags.value = [...tasteProfileStore.profile.flavorTags];
};

const loadInitialData = async () => {
  isLoadingCategories.value = true;
  feedbackMessage.value = '';
  feedbackType.value = 'idle';

  try {
    const categoryResponse = await apiService.get('categories');
    categories.value = Array.isArray(categoryResponse) ? categoryResponse : [];
  } catch (error) {
    categories.value = [];
    feedbackMessage.value = resolveApiErrorMessage(
        error,
        '카테고리를 불러오지 못했습니다. PostgreSQL과 백엔드 dev 서버가 실행 중인지 확인해주세요.'
    );
    feedbackType.value = 'error';
    return;
  } finally {
    isLoadingCategories.value = false;
  }

  const profileResult = await tasteProfileStore.loadProfile();
  if (profileResult.success) {
    applyProfileSelection();
    return;
  }

  if (localStorage.getItem('Authorization')) {
    feedbackMessage.value = profileResult.error;
    feedbackType.value = 'error';
  }
};

const saveProfile = async () => {
  if (selectedCount.value === 0) {
    feedbackMessage.value = '카테고리 또는 맛 태그를 하나 이상 선택해주세요.';
    feedbackType.value = 'error';
    return;
  }

  const result = await tasteProfileStore.saveProfile(selectedCategories.value, selectedFlavorTags.value);
  if (!result.success) {
    feedbackMessage.value = result.error;
    feedbackType.value = 'error';
    return;
  }

  feedbackMessage.value = '취향 설정을 저장했습니다.';
  feedbackType.value = 'success';
  await router.push({name: 'courseCreate'});
};

onMounted(loadInitialData);
</script>
