<template>
  <Teleport to="body">
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-map-picker-title"
        @click.self="handleClose"
    >
      <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-md bg-white text-left shadow-xl">
        <div class="flex items-center justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <h2 id="place-map-picker-title" class="text-lg font-bold text-zinc-950">장소 선택</h2>
          <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              @click="handleClose"
          >
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div class="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="min-h-[360px] bg-zinc-100 lg:min-h-[560px]">
            <div ref="mapElement" class="h-full min-h-[360px] w-full lg:min-h-[560px]"></div>
          </div>

          <aside class="flex min-h-0 flex-col border-t border-zinc-200 lg:border-l lg:border-t-0">
            <form class="border-b border-zinc-200 p-4" @submit.prevent="searchPlaces">
              <label class="block">
                <span class="text-sm font-semibold text-zinc-700">검색</span>
                <span class="mt-1 flex h-10 items-center rounded-md border border-zinc-300 bg-white px-3 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500">
                  <MagnifyingGlassIcon class="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                  <input
                      v-model.trim="searchText"
                      type="search"
                      class="h-full min-w-0 flex-1 border-0 px-2 text-sm outline-none focus:ring-0"
                      placeholder="장소 검색"
                  />
                </span>
              </label>
              <button
                  type="submit"
                  :disabled="!canSearch"
                  class="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
              >
                {{ isSearching ? '검색 중...' : '검색' }}
              </button>
              <p v-if="errorMessage" class="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {{ errorMessage }}
              </p>
            </form>

            <div class="min-h-0 flex-1 overflow-y-auto p-2">
              <div v-if="searchResults.length === 0" class="px-3 py-8 text-center text-sm text-zinc-500">
                검색 결과가 없습니다.
              </div>
              <div v-else class="space-y-1">
                <button
                    v-for="place in searchResults"
                    :key="place.place_id || `${getPlaceName(place)}-${getPlaceAddress(place)}`"
                    type="button"
                    class="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-zinc-50"
                    @click="selectSearchResult(place)"
                >
                  <MapPinIcon class="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-zinc-950">{{ getPlaceName(place) }}</span>
                    <span v-if="getPlaceAddress(place)" class="mt-1 block line-clamp-2 text-xs leading-5 text-zinc-500">
                      {{ getPlaceAddress(place) }}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <div class="border-t border-zinc-200 p-4">
              <label class="block">
                <span class="text-sm font-semibold text-zinc-700">장소 이름</span>
                <input
                    v-model.trim="placeName"
                    type="text"
                    class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500 disabled:bg-zinc-100"
                    :disabled="!selectedPlace"
                    placeholder="장소 이름"
                />
              </label>

              <div v-if="selectedPlace" class="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {{ formatCoordinates(selectedPlace.lat, selectedPlace.lng) }}
              </div>

              <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    @click="handleClose"
                >
                  취소
                </button>
                <button
                    type="button"
                    :disabled="!canConfirm"
                    class="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                    @click="confirmSelection"
                >
                  선택
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {computed, defineEmits, defineProps, nextTick, onBeforeUnmount, ref, watch} from 'vue';
import {MagnifyingGlassIcon, MapPinIcon, XMarkIcon} from '@heroicons/vue/24/outline';
import {loadGoogleMapsAPI} from '@/utils/googleMaps';

const DEFAULT_CENTER = {lat: 37.5665, lng: 126.9780};
const MAP_ID = '4504f8b37365c3d0';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  initialPlaceName: {
    type: String,
    default: ''
  },
  initialLatitude: {
    type: [Number, String],
    default: null
  },
  initialLongitude: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['close', 'select']);

const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API;
const mapElement = ref(null);
const searchText = ref('');
const searchResults = ref([]);
const selectedPlace = ref(null);
const placeName = ref('');
const isSearching = ref(false);
const isMapReady = ref(false);
const errorMessage = ref('');

let googleMapsApi = null;
let mapInstance = null;
let placesService = null;
let placesServiceStatus = null;
let AdvancedMarkerElementConstructor = null;
let selectedMarker = null;
let mapClickListener = null;

const normalizeCoordinate = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const getInitialPosition = () => {
  const lat = normalizeCoordinate(props.initialLatitude);
  const lng = normalizeCoordinate(props.initialLongitude);
  if (lat === null || lng === null) {
    return null;
  }
  return {lat, lng};
};

const canSearch = computed(() => Boolean(searchText.value.trim()) && isMapReady.value && !isSearching.value);

const canConfirm = computed(() => {
  return Boolean(selectedPlace.value)
      && Number.isFinite(Number(selectedPlace.value.lat))
      && Number.isFinite(Number(selectedPlace.value.lng))
      && Boolean(placeName.value.trim());
});

const formatCoordinates = (lat, lng) => {
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
};

const getPlaceName = (place) => place?.name || place?.formatted_address || '장소';

const getPlaceAddress = (place) => place?.formatted_address || place?.vicinity || '';

const getPlacePosition = (place) => {
  const location = place?.geometry?.location;
  if (!location) {
    return null;
  }

  return {
    lat: typeof location.lat === 'function' ? location.lat() : Number(location.lat),
    lng: typeof location.lng === 'function' ? location.lng() : Number(location.lng)
  };
};

const clearMarker = () => {
  if (selectedMarker) {
    selectedMarker.map = null;
    selectedMarker = null;
  }
};

const clearMap = () => {
  clearMarker();
  if (mapClickListener) {
    mapClickListener.remove();
    mapClickListener = null;
  }
  mapInstance = null;
  placesService = null;
  placesServiceStatus = null;
  isMapReady.value = false;
};

const setSelectedPlace = ({name, address = '', lat, lng, panTo = true}) => {
  const position = {lat: Number(lat), lng: Number(lng)};
  if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
    return;
  }

  selectedPlace.value = {
    name: name || '선택한 위치',
    address,
    ...position
  };
  placeName.value = selectedPlace.value.name;

  if (!mapInstance || !AdvancedMarkerElementConstructor) {
    return;
  }

  clearMarker();
  selectedMarker = new AdvancedMarkerElementConstructor({
    map: mapInstance,
    position,
    title: selectedPlace.value.name
  });

  if (panTo) {
    mapInstance.panTo(position);
    mapInstance.setZoom(15);
  }
};

const resetState = () => {
  const initialPosition = getInitialPosition();
  const initialName = props.initialPlaceName || '';

  searchText.value = initialName;
  searchResults.value = [];
  selectedPlace.value = initialPosition
      ? {
        name: initialName || '선택한 위치',
        address: '',
        ...initialPosition
      }
      : null;
  placeName.value = initialName;
  errorMessage.value = '';
  isSearching.value = false;
};

const initializeMap = async () => {
  if (!apiKey) {
    errorMessage.value = 'Google Maps API 키가 설정되어 있지 않습니다.';
    return;
  }

  await nextTick();
  if (!mapElement.value) {
    return;
  }

  try {
    googleMapsApi = googleMapsApi || await loadGoogleMapsAPI(apiKey);
    const {Map} = await googleMapsApi.importLibrary('maps');
    const {AdvancedMarkerElement} = await googleMapsApi.importLibrary('marker');
    const placesLibrary = await googleMapsApi.importLibrary('places');
    const PlacesServiceConstructor = placesLibrary.PlacesService || googleMapsApi.places?.PlacesService;
    placesServiceStatus = placesLibrary.PlacesServiceStatus || googleMapsApi.places?.PlacesServiceStatus;

    if (!PlacesServiceConstructor || !placesServiceStatus) {
      throw new Error('Google Places service is unavailable.');
    }

    AdvancedMarkerElementConstructor = AdvancedMarkerElement;
    const initialPosition = getInitialPosition();
    const center = initialPosition || DEFAULT_CENTER;

    mapInstance = new Map(mapElement.value, {
      center,
      zoom: initialPosition ? 15 : 11,
      mapId: MAP_ID
    });
    placesService = new PlacesServiceConstructor(mapInstance);
    isMapReady.value = true;

    mapClickListener = mapInstance.addListener('click', (event) => {
      if (!event.latLng) return;
      setSelectedPlace({
        name: placeName.value || searchText.value || '선택한 위치',
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    });

    if (initialPosition) {
      setSelectedPlace({
        name: props.initialPlaceName || '선택한 위치',
        ...initialPosition,
        panTo: false
      });
    }
  } catch (error) {
    console.error('장소 선택 지도를 초기화하지 못했습니다.', error);
    errorMessage.value = '장소 선택 지도를 불러오지 못했습니다.';
    clearMap();
  }
};

const searchPlaces = () => {
  const query = searchText.value.trim();
  if (!query || !placesService || isSearching.value) {
    return;
  }

  isSearching.value = true;
  errorMessage.value = '';

  placesService.textSearch({
    query,
    location: mapInstance?.getCenter(),
    radius: 50000
  }, (results, status) => {
    isSearching.value = false;
    const successStatus = placesServiceStatus?.OK;

    if (status !== successStatus || !Array.isArray(results)) {
      searchResults.value = [];
      if (status !== placesServiceStatus?.ZERO_RESULTS) {
        errorMessage.value = '장소를 검색하지 못했습니다.';
      }
      return;
    }

    searchResults.value = results.slice(0, 8);
    if (searchResults.value.length > 0) {
      selectSearchResult(searchResults.value[0]);
    }
  });
};

const selectSearchResult = (place) => {
  const position = getPlacePosition(place);
  if (!position) {
    return;
  }

  setSelectedPlace({
    name: getPlaceName(place),
    address: getPlaceAddress(place),
    ...position
  });
};

const confirmSelection = () => {
  if (!canConfirm.value) {
    return;
  }

  emit('select', {
    name: placeName.value.trim(),
    lat: selectedPlace.value.lat,
    lng: selectedPlace.value.lng,
    latitude: selectedPlace.value.lat,
    longitude: selectedPlace.value.lng,
    address: selectedPlace.value.address || ''
  });
};

const handleClose = () => {
  emit('close');
};

watch(
    () => props.isOpen,
    async (isOpen) => {
      if (!isOpen) {
        clearMap();
        return;
      }

      resetState();
      await initializeMap();
    }
);

onBeforeUnmount(clearMap);
</script>
