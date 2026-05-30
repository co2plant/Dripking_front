<template>
  <div class="relative max-w-5xl mx-auto px-4" ref="listContainer">
    <div class="mb-5 flex justify-end">
      <label class="flex items-center gap-2 text-sm font-medium text-zinc-700">
        정렬
        <select v-model="sortValue" class="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm">
          <option v-if="supportsPopularitySort" value="popularity">인기순</option>
          <option value="id,desc">최신순</option>
          <option value="rating,desc">평점순</option>
          <option value="name,asc">이름순</option>
        </select>
      </label>
    </div>
    <section class="space-y-8">
      <div v-for="item in items" :key="item.id"
           class="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-lg">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/3 relative overflow-hidden group">
            <img
                :src="getImageUrl(item)"
                :alt="item.name"
                class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div
                class="absolute inset-0 bg-zinc-900 bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20"></div>
          </div>
          <div class="md:w-2/3 p-6 flex flex-col justify-between group">
            <div @click="handleViewDetails(item)" class="cursor-pointer">
              <h4 class="text-2xl font-bold text-zinc-900 transform transition-transform duration-300">{{
                  item.name
                }}</h4>
              <p class="text-zinc-900 transition-all">{{ item.description }}</p>
              <p v-if="item.popularityScore !== undefined" class="mt-2 text-sm font-medium text-amber-700">
                인기 점수 {{ item.popularityScore }} · {{ item.popularityEventCount }}개 신호
              </p>
              <p class="text-xl font-bold text-zinc-900">{{ item.date }}</p>
            </div>
            <button
                @click="wishStore.toggleWishlist(item, props.itemType)"
                class="w-full py-2 rounded-full font-medium transition-colors"
                :class="wishStore.isInWishlist(item, props.itemType)
                    ? 'bg-zinc-900 text-white duration-600 hover:bg-amber-400 hover:text-zinc-900 hover:scale-102'
                    : 'bg-amber-400 text-zinc-900 duration-600 hover:bg-zinc-900 hover:text-white hover:scale-102'"
            >
              {{ wishStore.isInWishlist(item, props.itemType) ? 'Remove from Wishlist' : 'Add to Wishlist' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- List End Marker -->
    <div ref="listEndMarker" class="h-1 w-full"></div>

    <!-- Next Page Indicator -->
    <div
        v-if="hasMore && !isLoading && showNextPageIndicator && !error"
        class="py-6 text-center border-t border-zinc-100 mt-4"
        ref="nextPageIndicator"
    >
      <div class="text-zinc-500 mb-2">아래로 스크롤하여 더 보기</div>
      <svg
          class="w-6 h-6 mx-auto text-zinc-400 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
      >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </div>

    <!-- Loading Indicator -->
    <div
        v-if="isLoading"
        class="py-6 text-center border-t border-zinc-100 mt-4"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-200 border-t-blue-500"></div>
      <div class="mt-2 text-zinc-600">로딩 중...</div>
    </div>

    <!-- Error Message -->
    <div
        v-if="error"
        class="py-6 text-center border-t border-zinc-100 mt-4 text-red-600"
    >
      {{ error }}
      <button
          @click="retryLoading"
          class="text-blue-500 hover:text-blue-600 ml-2 underline"
      >
        다시 시도
      </button>
    </div>

    <div
        v-if="!isLoading && !error && items.length === 0 && !hasMore"
        class="rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500"
    >
      표시할 항목이 없습니다.
    </div>
  </div>
</template>

<script setup>
import  {computed, defineProps, defineEmits, ref, onMounted, onUnmounted, watch} from 'vue'
import {useWishStore} from "@/stores/useWishStore";
import {apiService} from "@/services/api";
import {getValidCoordinateBounds} from "@/utils/coordinates";
import {recordInteractionEvent} from "@/services/interactionEvents";

const wishStore = useWishStore();

const props = defineProps({
  itemType: {
    type: String,
    required: true
  },
  selectedItem: {
    type: Number,
    required: false
  },
  coordinateBounds: {
    type: Object,
    required: false,
    default: null
  },
  searchKeyword: {
    type: String,
    required: false,
    default: ''
  }
})

const itemTypeEnum = {
  DISTILLERY: 'distilleries',
  DESTINATION: 'destinations',
  ALCOHOL: 'alcohols'
}

const popularityEndpoints = {
  DISTILLERY: 'recommendations/popular-distilleries',
  DESTINATION: 'recommendations/popular-destinations',
  ALCOHOL: 'recommendations/popular-alcohols'
}

const emit = defineEmits(['view-details'])

const items = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(0)
const hasMore = ref(true)
const sortValue = ref('id,desc')
const listContainer = ref(null)
const nextPageIndicator = ref(null)
const showNextPageIndicator = ref(false)
const canFetchMore = ref(true)
const listEndMarker = ref(null)
const getImageUrl = (item) => item.imgUrl || item.img_url
const PAGE_SIZE = 10

const supportsPopularitySort = computed(() => {
  const searchKeyword = props.searchKeyword.trim()
  const coordinateBounds = getValidCoordinateBounds(props.coordinateBounds)
  return Boolean(popularityEndpoints[props.itemType]) && !searchKeyword && !coordinateBounds && !props.selectedItem
})

const handleViewDetails = (item) => {
  recordInteractionEvent(props.itemType, item.id, 'LIST_CARD_CLICK');
  emit('view-details', item);
}

const buildQueryString = (params) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.set(key, value);
    }
  });

  return query.toString();
}

const buildItemsEndpoint = () => {
  const resource = itemTypeEnum[props.itemType]
  const params = {
    page: currentPage.value,
    size: PAGE_SIZE,
    sort: sortValue.value,
  }
  const searchKeyword = props.searchKeyword.trim()
  const coordinateBounds = getValidCoordinateBounds(props.coordinateBounds)

  if (searchKeyword) {
    return `${resource}/search/${encodeURIComponent(searchKeyword)}?${buildQueryString(params)}`
  }

  if (coordinateBounds && ['destinations', 'distilleries'].includes(resource)) {
    return `${resource}/latlng?${buildQueryString({...params, ...coordinateBounds})}`
  }

  if (resource === 'alcohols') {
    params.categoryId = props.selectedItem
  } else if (resource === 'destinations') {
    params.countryId = props.selectedItem
  }

  return `${resource}?${buildQueryString(params)}`
}

const normalizePopularItem = (item) => ({
  ...item,
  id: item.targetId,
  imgUrl: item.imgUrl,
  popularityScore: item.score,
  popularityEventCount: item.eventCount
})

// Fetch items from the API
const fetchItems = async () => {
  if (!hasMore.value || isLoading.value || !canFetchMore.value) return

  isLoading.value = true
  error.value = null
  canFetchMore.value = false

  try {
    if (sortValue.value === 'popularity' && supportsPopularitySort.value) {
      const endpoint = `${popularityEndpoints[props.itemType]}?window=all&limit=50`
      const response = await apiService.get(endpoint)
      items.value = Array.isArray(response) ? response.map(normalizePopularItem) : []
      hasMore.value = false
      showNextPageIndicator.value = false
      return
    }

    const response = await apiService.get(buildItemsEndpoint())
    items.value = [...items.value, ...response.content]
    hasMore.value = !response.last
    currentPage.value++

    // Reset indicators after successful fetch
    showNextPageIndicator.value = false

    // Small delay before allowing next fetch
    setTimeout(() => {
      if (hasMore.value) {
        showNextPageIndicator.value = true
      }
    }, 500)

  } catch (err) {
    console.error('Error fetching items:', err)
    error.value = '데이터를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const resetItems = () => {
  if (sortValue.value === 'popularity' && !supportsPopularitySort.value) {
    sortValue.value = 'id,desc'
    return
  }

  hasMore.value=true
  canFetchMore.value = true
  currentPage.value = 0
  items.value = []
  fetchItems()
}

watch(() => props.selectedItem, () => {
  resetItems();
})

watch(() => props.coordinateBounds, () => {
  resetItems();
}, {deep: true})

watch(() => props.searchKeyword, () => {
  resetItems();
})

watch(supportsPopularitySort, (isSupported) => {
  if (!isSupported && sortValue.value === 'popularity') {
    sortValue.value = 'id,desc'
  }
})

watch(sortValue, () => {
  resetItems();
})

const retryLoading = () => {
  error.value = null;
  canFetchMore.value = true;
  fetchItems();
};

let observer;
const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.9) {
          if (!showNextPageIndicator.value && hasMore.value) {
            showNextPageIndicator.value = true;
          } else if (showNextPageIndicator.value && hasMore.value) {
            canFetchMore.value = true;
            fetchItems();
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.9, 1.0]
      }
  );

  if (listEndMarker.value) {
    observer.observe(listEndMarker.value);
  }
};

onMounted(() => {
  wishStore.loadWishlist();
  fetchItems();
  setupIntersectionObserver();
});

onUnmounted(() => {
  wishStore.sortWishlist();
  wishStore.saveWishlist();
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
