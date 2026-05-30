<template>
  <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">대시보드</h1>
      <p class="text-sm text-zinc-500">운영 현황과 인기 신호를 확인합니다.</p>
    </header>

    <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </p>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="stat in stats" :key="stat.key" class="rounded-md border border-zinc-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-zinc-600">{{ stat.title }}</p>
          <component :is="stat.icon" class="h-4 w-4 text-amber-600" />
        </div>
        <p class="mt-3 text-2xl font-bold text-zinc-950">{{ stat.value }}</p>
        <p class="mt-1 text-xs text-zinc-500">{{ stat.description }}</p>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div class="rounded-md border border-zinc-200 bg-white">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
          <div>
            <h2 class="text-base font-semibold text-zinc-950">인기 콘텐츠</h2>
            <p class="text-sm text-zinc-500">상호작용 이벤트 기반 점수입니다.</p>
          </div>
          <div class="inline-flex rounded-md border border-zinc-200 bg-zinc-50 p-1">
            <button
                v-for="option in windowOptions"
                :key="option.value"
                type="button"
                @click="setWindow(option.value)"
                :class="[
                  'rounded px-3 py-1.5 text-sm font-medium',
                  selectedWindow === option.value ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="grid gap-0 lg:grid-cols-2">
          <PopularList title="인기 여행지" :items="popularDestinations" empty-text="인기 여행지 이벤트가 없습니다." />
          <PopularList title="인기 술" :items="popularAlcohols" empty-text="인기 술 이벤트가 없습니다." />
        </div>
      </div>

      <div class="rounded-md border border-zinc-200 bg-white">
        <div class="border-b border-zinc-200 px-4 py-3">
          <h2 class="text-base font-semibold text-zinc-950">최근 활동</h2>
          <p class="text-sm text-zinc-500">최근 기록된 사용자 상호작용입니다.</p>
        </div>

        <div v-if="isLoading" class="px-4 py-8 text-center text-sm text-zinc-500">
          대시보드 데이터를 불러오는 중입니다.
        </div>
        <div v-else-if="activities.length === 0" class="px-4 py-8 text-center text-sm text-zinc-500">
          표시할 활동이 없습니다.
        </div>
        <ol v-else class="divide-y divide-zinc-100">
          <li v-for="activity in activities" :key="`${activity.activityType}-${activity.occurredAt}-${activity.description}`" class="px-4 py-3">
            <p class="text-sm font-medium text-zinc-950">{{ activity.title }}</p>
            <p class="mt-1 text-sm text-zinc-600">{{ activity.description }}</p>
            <p class="mt-1 text-xs text-zinc-400">{{ formatDateTime(activity.occurredAt) }}</p>
          </li>
        </ol>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { Beer, Flag, Map, Plane, Users } from 'lucide-vue-next';
import { apiService } from '@/services/api';

const summary = ref(null);
const activities = ref([]);
const popularDestinations = ref([]);
const popularAlcohols = ref([]);
const selectedWindow = ref('7d');
const isLoading = ref(false);
const error = ref('');

const windowOptions = [
  { label: '7일', value: '7d' },
  { label: '30일', value: '30d' },
  { label: '전체', value: 'all' },
];

const formatNumber = (value) => Number(value || 0).toLocaleString();

const stats = computed(() => [
  {
    key: 'users',
    title: '총 사용자',
    value: formatNumber(summary.value?.totalUsers),
    icon: Users,
    description: `열린 신고 ${formatNumber(summary.value?.openReviewReports)}건`,
  },
  {
    key: 'destinations',
    title: '여행지',
    value: formatNumber(summary.value?.totalDestinations),
    icon: Map,
    description: `좌표 누락 ${formatNumber(summary.value?.missingDestinationCoordinates)}건`,
  },
  {
    key: 'distilleries',
    title: '양조장',
    value: formatNumber(summary.value?.totalDistilleries),
    icon: Flag,
    description: `좌표 누락 ${formatNumber(summary.value?.missingDistilleryCoordinates)}건`,
  },
  {
    key: 'planning',
    title: '여행 계획',
    value: formatNumber(summary.value?.totalTrips),
    icon: Plane,
    description: `일정 아이템 ${formatNumber(summary.value?.totalPlans)}개`,
  },
]);

const loadDashboard = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const [summaryResponse, activityResponse] = await Promise.all([
      apiService.getWithToken('admin/dashboard/summary'),
      apiService.getWithToken('admin/dashboard/activity'),
    ]);
    summary.value = summaryResponse;
    activities.value = Array.isArray(activityResponse) ? activityResponse : [];
    await loadPopularItems();
  } catch (err) {
    console.error('Dashboard loading failed:', err);
    error.value = '대시보드 데이터를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const loadPopularItems = async () => {
  const [destinationsResponse, alcoholsResponse] = await Promise.all([
    apiService.getWithToken(`admin/dashboard/popular-destinations?window=${selectedWindow.value}&limit=5`),
    apiService.getWithToken(`admin/dashboard/popular-alcohols?window=${selectedWindow.value}&limit=5`),
  ]);

  popularDestinations.value = Array.isArray(destinationsResponse) ? destinationsResponse : [];
  popularAlcohols.value = Array.isArray(alcoholsResponse) ? alcoholsResponse : [];
};

const setWindow = async (value) => {
  selectedWindow.value = value;
  try {
    await loadPopularItems();
  } catch (err) {
    console.error('Popular item loading failed:', err);
    error.value = '인기 콘텐츠 데이터를 불러오지 못했습니다.';
  }
};

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const PopularList = defineComponent({
  props: {
    title: { type: String, required: true },
    items: { type: Array, required: true },
    emptyText: { type: String, required: true },
  },
  setup(props) {
    return () => h('section', { class: 'border-b border-zinc-100 p-4 lg:border-b-0 lg:border-r lg:last:border-r-0' }, [
      h('h3', { class: 'text-sm font-semibold text-zinc-950' }, props.title),
      props.items.length === 0
          ? h('p', { class: 'py-8 text-center text-sm text-zinc-500' }, props.emptyText)
          : h('ol', { class: 'mt-3 space-y-3' }, props.items.map((item, index) => h('li', {
            key: `${item.itemType}-${item.targetId}`,
            class: 'flex items-center gap-3 rounded-md border border-zinc-100 p-3',
          }, [
            h('div', { class: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-sm font-bold text-amber-800' }, String(index + 1)),
            h('div', { class: 'min-w-0 flex-1' }, [
              h('p', { class: 'truncate text-sm font-medium text-zinc-950' }, item.name),
              h('p', { class: 'truncate text-xs text-zinc-500' }, `${item.eventCount}개 이벤트 / 점수 ${item.score}`),
            ]),
            h(Beer, { class: 'h-4 w-4 shrink-0 text-zinc-400' }),
          ]))),
    ]);
  },
});

onMounted(() => {
  loadDashboard();
});
</script>
