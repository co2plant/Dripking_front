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
      <NearbyPositionFilter
          @location-selected="handleLocationSelected"
          @location-cleared="clearLocationCheck"
      />

      <p
          v-if="locationCheckMessage"
          role="status"
          class="mx-auto max-w-5xl rounded-md border px-4 py-3 text-sm font-medium"
          :class="locationStatusClass"
      >
        {{ locationCheckMessage }}
      </p>

      <div
          v-if="!isLocationVerified"
          class="mx-auto max-w-5xl rounded-md border border-zinc-200 bg-zinc-50 px-5 py-10 text-center text-sm text-zinc-500"
      >
        현재 위치가 확인되면 주변 목록이 표시됩니다.
      </div>

      <template v-else>
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

        <p
            v-if="addPlanFeedback"
            role="status"
            class="mx-auto max-w-5xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-zinc-800"
        >
          {{ addPlanFeedback }}
        </p>

        <VerticalScrollCardList
            :key="activeItemType"
            :itemType="activeItemType"
            :coordinateBounds="coordinateBounds"
            :showPlanActions="true"
            :plannedItemKeys="plannedItemKeys"
            :addingItemKey="addingItemKey"
            @view-details="handleViewDetails"
            @add-to-plan="handleAddToPlan"
        />
      </template>
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
import {apiService} from '@/services/api';
import {
  getCoordinateBoundsFromCenter,
  getDistanceKm,
  getValidCoordinates,
  normalizeCoordinates,
} from '@/utils/coordinates';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const planStore = usePlanStore();
const trip = ref(null);
const isLoading = ref(true);
const coordinateBounds = ref(null);
const verifiedPosition = ref(null);
const locationCheckStatus = ref('idle');
const locationCheckMessage = ref('');
const activeItemType = ref('DESTINATION');
const addingItemKey = ref('');
const addPlanFeedback = ref('');
let feedbackTimer = null;

const TRIP_AREA_RADIUS_KM = 50;

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

const tripPlanLocations = computed(() => tripPlans.value
    .map((plan) => {
      const coordinates = getValidCoordinates({
        latitude: plan.latitude ?? plan.snapshot_latitude,
        longitude: plan.longitude ?? plan.snapshot_longitude,
      });

      if (coordinates === null) {
        return null;
      }

      return {
        name: plan.place_name || plan.snapshot_name || plan.name || '일정 장소',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      };
    })
    .filter(Boolean));

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

const isLocationVerified = computed(() => locationCheckStatus.value === 'verified' && coordinateBounds.value !== null);

const locationStatusClass = computed(() => {
  if (locationCheckStatus.value === 'verified') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }

  if (locationCheckStatus.value === 'checking') {
    return 'border-sky-200 bg-sky-50 text-sky-800';
  }

  return 'border-red-200 bg-red-50 text-red-700';
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

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
};

const getTripCountryId = () => trip.value?.country_id ?? trip.value?.countryId;

const getTripCountryName = () => trip.value?.country ?? trip.value?.countryName ?? trip.value?.country_name;

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(1)}km`;
};

const isDestinationInTripCountry = (destination) => {
  const tripCountryId = getTripCountryId();
  const destinationCountryId = destination.countryId ?? destination.country_id;
  if (tripCountryId !== null && tripCountryId !== undefined && destinationCountryId !== null && destinationCountryId !== undefined) {
    return String(destinationCountryId) === String(tripCountryId);
  }

  const tripCountryName = normalizeText(getTripCountryName());
  const destinationCountryName = normalizeText(destination.countryName ?? destination.country_name ?? destination.country);
  return tripCountryName !== '' && destinationCountryName !== '' && destinationCountryName === tripCountryName;
};

const findNearbyTripCountryDestination = async (location) => {
  if (!getTripCountryId() && !getTripCountryName()) {
    return null;
  }

  const bounds = getCoordinateBoundsFromCenter({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: Math.max(TRIP_AREA_RADIUS_KM, Number(location.radiusKm) || 0),
  });

  if (bounds === null) {
    return null;
  }

  try {
    const response = await apiService.get(`destinations/latlng?${buildQueryString({
      ...bounds,
      page: 0,
      size: 20,
      sort: 'id,desc',
    })}`);
    const destinations = Array.isArray(response?.content) ? response.content : [];
    return destinations.find(isDestinationInTripCountry) || null;
  } catch (error) {
    console.error('Error checking nearby destination country:', error);
    return null;
  }
};

const findNearestPlanLocation = (location) => {
  return tripPlanLocations.value.reduce((nearest, planLocation) => {
    const distanceKm = getDistanceKm(location, planLocation);
    if (distanceKm === null) {
      return nearest;
    }

    if (nearest === null || distanceKm < nearest.distanceKm) {
      return {
        ...planLocation,
        distanceKm,
      };
    }

    return nearest;
  }, null);
};

const verifyTripLocation = async (location) => {
  const countryDestination = await findNearbyTripCountryDestination(location);
  if (countryDestination) {
    return {
      success: true,
      message: `${countryDestination.name} 주변으로 확인되어 주변 추천을 불러옵니다.`,
    };
  }

  const nearestPlanLocation = findNearestPlanLocation(location);
  if (nearestPlanLocation && nearestPlanLocation.distanceKm <= TRIP_AREA_RADIUS_KM) {
    return {
      success: true,
      message: `${nearestPlanLocation.name}에서 ${formatDistance(nearestPlanLocation.distanceKm)} 거리로 확인되어 주변 추천을 불러옵니다.`,
    };
  }

  if (nearestPlanLocation) {
    return {
      success: false,
      message: `현재 위치가 가장 가까운 일정 장소(${nearestPlanLocation.name})에서 ${formatDistance(nearestPlanLocation.distanceKm)} 떨어져 있습니다. 여행지 근처에서 다시 위치를 공유해주세요.`,
    };
  }

  if (getTripCountryName()) {
    return {
      success: false,
      message: `현재 위치 주변에서 ${getTripCountryName()} 여행지로 확인되는 장소를 찾지 못했습니다. 여행지 근처에서 다시 위치를 공유해주세요.`,
    };
  }

  return {
    success: false,
    message: '여행 국가나 좌표가 있는 일정이 없어 현재 위치를 여행 중으로 확인할 수 없습니다.',
  };
};

const handleLocationSelected = async (location) => {
  locationCheckStatus.value = 'checking';
  locationCheckMessage.value = '현재 위치를 여행 정보와 대조하는 중입니다.';
  coordinateBounds.value = null;
  verifiedPosition.value = null;

  const verification = await verifyTripLocation(location);

  if (!verification.success) {
    locationCheckStatus.value = 'outside';
    locationCheckMessage.value = verification.message;
    return;
  }

  verifiedPosition.value = {
    latitude: location.latitude,
    longitude: location.longitude,
  };
  coordinateBounds.value = location.bounds;
  locationCheckStatus.value = 'verified';
  locationCheckMessage.value = verification.message;
};

const clearLocationCheck = () => {
  coordinateBounds.value = null;
  verifiedPosition.value = null;
  locationCheckStatus.value = 'idle';
  locationCheckMessage.value = '';
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
