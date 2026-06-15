<template>
  <div class="mx-auto max-w-6xl px-4 py-8 text-left">
    <section class="mb-8 border-b border-zinc-200 pb-6">
      <router-link
          :to="{ name: 'tripModify', params: { id: route.params.id } }"
          class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
      >
        <arrow-left-icon class="h-4 w-4" />
        일정으로 돌아가기
      </router-link>

      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-zinc-950">여행 중 주변 탐색</h1>
          <div v-if="trip" class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600">
            <span class="inline-flex items-center gap-2">
              <calendar-icon class="h-4 w-4 text-amber-500" />
              {{ trip.start_date }} ~ {{ trip.end_date }}
            </span>
            <span class="inline-flex items-center gap-2">
              <map-pin-icon class="h-4 w-4 text-amber-500" />
              {{ trip.country || '여행 국가' }}
            </span>
          </div>
        </div>

        <router-link
            v-if="trip"
            :to="{ name: 'tripModify', params: { id: route.params.id } }"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <calendar-days-icon class="h-4 w-4" />
          일정 보기
        </router-link>
      </div>
    </section>

    <section v-if="isLoading" class="py-20 text-center text-sm text-zinc-500">
      여행 정보를 불러오는 중입니다.
    </section>

    <section v-else-if="!trip" class="mx-auto max-w-2xl rounded-md border border-zinc-200 bg-white px-5 py-12 text-center">
      <h2 class="text-xl font-bold text-zinc-950">여행을 찾을 수 없습니다.</h2>
      <router-link
          :to="{ name: 'tripCreate' }"
          class="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-amber-400 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500"
      >
        내 여행 보기
      </router-link>
    </section>

    <section v-else-if="!isTripInProgress" class="mx-auto max-w-2xl rounded-md border border-zinc-200 bg-white px-5 py-12 text-center">
      <h2 class="text-xl font-bold text-zinc-950">여행 기간 중에 열리는 페이지입니다.</h2>
      <p class="mt-3 text-sm text-zinc-600">{{ trip.start_date }} ~ {{ trip.end_date }}</p>
      <router-link
          :to="{ name: 'tripModify', params: { id: route.params.id } }"
          class="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        여행 일정으로 이동
      </router-link>
    </section>

    <section v-else class="space-y-6">
      <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <div class="inline-flex rounded-md border border-zinc-200 bg-white p-1">
          <button
              v-for="type in nearbyTypes"
              :key="type.value"
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-semibold transition-colors"
              :class="activeItemType === type.value ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'"
              @click="selectItemType(type.value)"
          >
            <component :is="type.icon" class="h-4 w-4" />
            {{ type.label }}
          </button>
        </div>
        <p v-if="coordinateBounds" class="text-sm text-zinc-500">
          {{ activeTypeLabel }} {{ currentRadiusLabel }}
        </p>
      </div>

      <NearbyPositionFilter @update-coordinate-bounds="updateCoordinateBounds" />

      <p
          v-if="addPlanFeedback"
          role="status"
          class="mx-auto max-w-5xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-zinc-800"
      >
        {{ addPlanFeedback }}
      </p>

      <div
          v-if="!coordinateBounds"
          class="mx-auto max-w-5xl rounded-md border border-zinc-200 bg-zinc-50 px-5 py-10 text-center text-sm text-zinc-500"
      >
        위치 기준이 설정되면 주변 목록이 표시됩니다.
      </div>

      <VerticalScrollCardList
          v-else
          :key="activeItemType"
          :itemType="activeItemType"
          :coordinateBounds="coordinateBounds"
          :showPlanActions="true"
          :plannedItemKeys="plannedItemKeys"
          :addingItemKey="addingItemKey"
          @view-details="handleViewDetails"
          @add-to-plan="handleAddToPlan"
      />
    </section>
  </div>
</template>

<script setup>
import {computed, markRaw, onMounted, onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {
  ArrowLeft as ArrowLeftIcon,
  Beer as BeerIcon,
  Calendar as CalendarIcon,
  CalendarDays as CalendarDaysIcon,
  MapPin as MapPinIcon,
} from 'lucide-vue-next';
import NearbyPositionFilter from '@/components/NearbyPositionFilter.vue';
import VerticalScrollCardList from '@/components/VerticalScrollCardList.vue';
import Plan from '@/composables/Entity/Plan';
import {useTripStore} from '@/stores/useTripStore';
import {usePlanStore} from '@/stores/usePlanStore';
import {normalizeCoordinates} from '@/utils/coordinates';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const planStore = usePlanStore();
const trip = ref(null);
const isLoading = ref(true);
const coordinateBounds = ref(null);
const activeItemType = ref('DESTINATION');
const addingItemKey = ref('');
const addPlanFeedback = ref('');
let feedbackTimer = null;

const nearbyTypes = [
  {value: 'DESTINATION', label: '여행지', routeName: 'destinationDetail', icon: markRaw(MapPinIcon)},
  {value: 'DISTILLERY', label: '양조장', routeName: 'distilleryDetail', icon: markRaw(BeerIcon)},
];

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDate = (date) => {
  if (!date || typeof date !== 'string') return '';
  return date.includes('T') ? date.slice(0, 10) : date;
};

const today = computed(() => formatDateInput(new Date()));

const isTripInProgress = computed(() => {
  const startDate = normalizeDate(trip.value?.start_date);
  const endDate = normalizeDate(trip.value?.end_date);
  if (!startDate || !endDate) return false;
  return startDate <= today.value && today.value <= endDate;
});

const defaultPlanDate = computed(() => {
  const startDate = normalizeDate(trip.value?.start_date);
  const endDate = normalizeDate(trip.value?.end_date);
  if (startDate && endDate && startDate <= today.value && today.value <= endDate) {
    return today.value;
  }
  return startDate || today.value;
});

const tripPlans = computed(() => planStore.Plans.filter(plan => String(plan.trip_id) === String(route.params.id)));

const getPlanTargetId = (plan) => plan.target_id ?? plan.targetId ?? plan.place_id ?? plan.placeId;

const getPlanItemKey = (plan) => {
  const itemType = plan.item_type ?? plan.itemType;
  const targetId = getPlanTargetId(plan);
  if (!itemType || targetId === null || targetId === undefined) return null;
  return `${itemType}:${targetId}`;
};

const plannedItemKeys = computed(() => tripPlans.value.map(getPlanItemKey).filter(Boolean));

const nextSortOrder = () => {
  const sortOrders = tripPlans.value
      .map(plan => Number(plan.sort_order))
      .filter(Number.isFinite);
  if (sortOrders.length === 0) {
    return tripPlans.value.length;
  }
  return Math.max(...sortOrders) + 1;
};

const activeType = computed(() => nearbyTypes.find(type => type.value === activeItemType.value) || nearbyTypes[0]);
const activeTypeLabel = computed(() => activeType.value.label);
const currentRadiusLabel = computed(() => {
  if (!coordinateBounds.value) return '';
  return '주변 결과';
});

const showAddPlanFeedback = (message) => {
  addPlanFeedback.value = message;
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
  feedbackTimer = setTimeout(() => {
    addPlanFeedback.value = '';
  }, 3000);
};

const getItemTargetId = (item) => item.targetId ?? item.target_id ?? item.id;

const getItemKey = (item) => `${activeItemType.value}:${getItemTargetId(item)}`;

const selectItemType = (itemType) => {
  activeItemType.value = itemType;
};

const updateCoordinateBounds = (bounds) => {
  coordinateBounds.value = bounds;
};

const handleViewDetails = (item) => {
  router.push({name: activeType.value.routeName, params: {id: item.id}});
};

const handleAddToPlan = async (item) => {
  const itemKey = getItemKey(item);
  if (plannedItemKeys.value.includes(itemKey)) {
    showAddPlanFeedback('이미 일정에 추가된 항목입니다.');
    return;
  }

  if (addingItemKey.value) return;

  addingItemKey.value = itemKey;
  const coordinates = normalizeCoordinates(item);
  const plan = new Plan()
      .setName(item.name)
      .setDescription(item.description)
      .setPlanDate(defaultPlanDate.value)
      .setStartTime('09:00')
      .setEndTime('10:00')
      .setTargetId(getItemTargetId(item))
      .setTripId(route.params.id)
      .setLatitude(coordinates.latitude)
      .setLongitude(coordinates.longitude)
      .setPlaceName(item.name || null)
      .setAddress(item.address || null)
      .setItemType(activeItemType.value)
      .build();

  plan.sort_order = nextSortOrder();
  plan.img_url = item.imgUrl || item.img_url || null;

  let addedPlan = null;
  try {
    addedPlan = await planStore.addPlan(plan);
  } finally {
    addingItemKey.value = '';
  }

  if (!addedPlan) {
    showAddPlanFeedback('일정을 추가하지 못했습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  showAddPlanFeedback(`${item.name} 항목을 일정에 추가했습니다.`);
};

onMounted(async () => {
  isLoading.value = true;
  await tripStore.loadTrips();
  trip.value = tripStore.findTripById(route.params.id) || null;
  if (trip.value) {
    await planStore.loadPlans(route.params.id);
  }
  isLoading.value = false;
});

onUnmounted(() => {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
});
</script>
