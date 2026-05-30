<template>
  <section class="mx-auto w-full max-w-7xl px-6 py-10">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-zinc-950">{{ title }}</h2>
        <p class="mt-1 text-sm text-zinc-500">{{ subtitle }}</p>
      </div>
      <div class="inline-flex rounded-md border border-zinc-200 bg-white p-1">
        <button
            v-for="option in windowOptions"
            :key="option.value"
            type="button"
            @click="setWindow(option.value)"
            :class="[
              'rounded px-3 py-1.5 text-sm font-medium',
              selectedWindow === option.value ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      인기 콘텐츠를 불러오는 중입니다.
    </div>
    <div v-else-if="items.length === 0" class="rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      아직 충분한 인기 데이터가 없습니다.
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <router-link
          v-for="item in items"
          :key="`${item.itemType}-${item.targetId}`"
          :to="{ name: detailRouteName, params: { id: item.targetId } }"
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
          <div class="flex items-center justify-between gap-3">
            <h3 class="truncate text-base font-semibold text-zinc-950">{{ item.name }}</h3>
            <span class="shrink-0 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{{ item.score }}</span>
          </div>
          <p class="mt-2 line-clamp-2 min-h-10 text-sm text-zinc-500">{{ item.description || '설명이 없습니다.' }}</p>
          <p class="mt-3 text-xs text-zinc-400">{{ item.eventCount }}개 인기 신호</p>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { defineProps, onMounted, ref } from 'vue';
import { apiService } from '@/services/api';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  endpoint: { type: String, required: true },
  detailRouteName: { type: String, required: true },
});

const windowOptions = [
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '전체', value: 'all' },
];

const selectedWindow = ref('7d');
const items = ref([]);
const isLoading = ref(false);

const loadItems = async () => {
  isLoading.value = true;
  try {
    const response = await apiService.get(`${props.endpoint}?window=${selectedWindow.value}&limit=8`);
    items.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Popular item loading failed:', error);
    items.value = [];
  } finally {
    isLoading.value = false;
  }
};

const setWindow = (value) => {
  selectedWindow.value = value;
  loadItems();
};

onMounted(() => {
  loadItems();
});
</script>
