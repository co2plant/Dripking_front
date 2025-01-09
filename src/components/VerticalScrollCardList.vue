<template>
  <div class="relative max-w-5xl mx-auto px-4" ref="listContainer">
    <!-- List Container -->
    <div class="space-y-4">
      <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4"
      >
        <div class="w-48 h-32 flex-shrink-0">
          <img
              :src="item.imageUrl || '/placeholder.svg?height=128&width=192'"
              :alt="item.title"
              class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div class="md:w-3/4 p-4">
          <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ item.name }}</h2>
          <p class="text-gray-600 mb-4 line-clamp-3">{{ item.description }}</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">{{ item.date }}</span>

            <button
                class="flex-shrink-0 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                @click="emit('view-details', item)"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List End Marker -->
    <div ref="listEndMarker" class="h-1 w-full"></div>

    <!-- Next Page Indicator -->
    <div
        v-if="hasMore && !isLoading && showNextPageIndicator"
        class="py-6 text-center border-t border-gray-100 mt-4"
        ref="nextPageIndicator"
    >
      <div class="text-gray-500 mb-2">아래로 스크롤하여 더 보기</div>
      <svg
          class="w-6 h-6 mx-auto text-gray-400 animate-bounce"
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
        class="py-6 text-center border-t border-gray-100 mt-4"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
      <div class="mt-2 text-gray-600">로딩 중...</div>
    </div>

    <!-- Error Message -->
    <div
        v-if="error"
        class="py-6 text-center border-t border-gray-100 mt-4 text-red-600"
    >
      {{ error }}
      <button
          @click="retryLoading"
          class="text-blue-500 hover:text-blue-600 ml-2 underline"
      >
        다시 시도
      </button>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, ref, onMounted, onUnmounted} from 'vue'

const props = defineProps({
  fetchUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['view-details'])

const items = ref([])
const isLoading = ref(false)
const error = ref(null)
const currentPage = ref(0)
const hasMore = ref(true)
const listContainer = ref(null)
const nextPageIndicator = ref(null)
const showNextPageIndicator = ref(false)
const canFetchMore = ref(true)
const listEndMarker = ref(null)

// Fetch items from the API
const fetchItems = async () => {
  if (!hasMore.value || isLoading.value || !canFetchMore.value) return

  isLoading.value = true
  error.value = null
  canFetchMore.value = false

  try {
    const response = await fetch(`${props.fetchUrl}?page=${currentPage.value}&size=10&sort=id,desc`)
    if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.')

    const data = await response.json()

    items.value = [...items.value, ...data.content]
    hasMore.value = !data.last
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

// Retry loading when error occurs
const retryLoading = () => {
  error.value = null
  canFetchMore.value = true
  fetchItems()
}

// Intersection Observer setup
let observer
const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.9) {
          if (!showNextPageIndicator.value && hasMore.value) {
            // First intersection: Show the indicator
            showNextPageIndicator.value = true
          } else if (showNextPageIndicator.value && hasMore.value) {
            // Second intersection: Fetch more items
            canFetchMore.value = true
            fetchItems()
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0.9, 1.0]
      }
  )

  if (listEndMarker.value) {
    observer.observe(listEndMarker.value)
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchItems()
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
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

