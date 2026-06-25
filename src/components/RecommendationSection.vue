<template>
  <section class="mx-auto w-full max-w-7xl px-6 py-10">
    <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 class="text-xl font-bold text-zinc-950">취향 추천</h2>
        <p class="mt-1 text-sm text-zinc-500">{{ subtitle }}</p>
      </div>
      <form class="grid gap-3 sm:grid-cols-[minmax(180px,220px)_minmax(220px,300px)_auto]" @submit.prevent="loadItems">
        <label class="text-sm font-medium text-zinc-700">
          카테고리
          <select v-model="selectedCategoryId" class="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm">
            <option value="">전체</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="text-sm font-medium text-zinc-700">
          맛 태그
          <input
              v-model="flavorTags"
              type="text"
              class="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              placeholder="peaty, sweet"
          />
        </label>
        <button
            type="submit"
            class="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <search-icon class="h-4 w-4" />
          추천 보기
        </button>
      </form>
    </div>

    <div v-if="isLoading" class="rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      추천을 불러오는 중입니다.
    </div>
    <div v-else-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
      {{ error }}
      <button type="button" class="ml-2 font-medium underline" @click="loadItems">
        다시 시도
      </button>
    </div>
    <div v-else-if="items.length === 0" class="rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      표시할 추천 항목이 없습니다.
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <router-link
          v-for="item in items"
          :key="`${item.itemType}-${item.targetId}`"
          :to="getDetailRouteForItem(item)"
          class="group overflow-hidden rounded-md border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="aspect-[4/3] overflow-hidden bg-zinc-100">
          <img
              v-if="item.imgUrl"
              :src="item.imgUrl"
              :alt="item.name"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4">
          <div class="mb-2 flex items-center justify-between gap-3">
            <span class="rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">{{ displayItemType(item.itemType) }}</span>
            <span class="shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{{ formatScore(item.score) }}</span>
          </div>
          <h3 class="truncate text-base font-semibold text-zinc-950">{{ item.name }}</h3>
          <p class="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-500">{{ item.description || '설명이 없습니다.' }}</p>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue';
import {Search as SearchIcon} from 'lucide-vue-next';
import {apiService, resolveApiErrorMessage} from '@/services/api';
import {getDetailRouteForItem} from '@/utils/detailRoutes';
import {useAuthStore} from '@/stores/useAuthStore';

const authStore = useAuthStore();

const categories = ref([]);
const selectedCategoryId = ref('');
const flavorTags = ref('');
const items = ref([]);
const isLoading = ref(false);
const error = ref('');

const subtitle = computed(() => (
  authStore.isAuthenticated()
      ? '저장한 취향과 위시리스트 신호를 함께 반영합니다.'
      : '카테고리와 맛 태그를 기준으로 탐색 후보를 제안합니다.'
));

const displayItemType = (itemType) => ({
  ALCOHOL: '술',
  DESTINATION: '여행지',
  DISTILLERY: '양조장',
}[itemType] || itemType);

const formatScore = (score) => {
  const numericScore = Number(score);
  return Number.isFinite(numericScore) ? numericScore.toFixed(2) : '0.00';
};

const buildEndpoint = () => {
  const params = new URLSearchParams({limit: '8'});
  if (selectedCategoryId.value) {
    params.set('categoryId', selectedCategoryId.value);
  }
  if (flavorTags.value.trim()) {
    params.set('flavorTags', flavorTags.value.trim());
  }
  return `recommendations?${params.toString()}`;
};

const loadCategories = async () => {
  try {
    categories.value = await apiService.get('categories');
  } catch (err) {
    console.error('Recommendation category loading failed:', err);
    categories.value = [];
  }
};

const loadItems = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await apiService.getWithOptionalToken(buildEndpoint());
    items.value = Array.isArray(response?.items) ? response.items.filter(getDetailRouteForItem) : [];
  } catch (err) {
    console.error('Recommendation loading failed:', err);
    items.value = [];
    error.value = resolveApiErrorMessage(err, '추천을 불러오지 못했습니다.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await authStore.initAuth();
  await Promise.all([loadCategories(), loadItems()]);
});
</script>
