<template>
  <div class="relative max-w-5xl mx-auto px-4" ref="listContainer">
    <section class="py-4 bg-white">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <span class="inline-block w-20 h-1 ml-2"></span>
          <!-- Wishlist Icon with Counter -->
          <div class="relative">
            <ShoppingCartIcon
                class="h-6 w-6 text-zinc-900 cursor-pointer"
                @click="isWishlistOpen = true"
            />
            <span v-if="WishlistItems.length"
                  class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                  @click="isWishlistOpen = true">
                      {{ WishlistItems.length }}
                  </span>
          </div>
        </div>
      </div>

      <!-- Wishlist Sidebar -->
      <div v-if="isWishlistOpen"
           class="fixed inset-0 bg-black bg-opacity-50 z-50"
           @click="isWishlistOpen = false">
        <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6"
             @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h4 class="text-xl font-bold text-zinc-900">Wishlist</h4>
            <XIcon
                class="h-6 w-6 text-zinc-900 cursor-pointer"
                @click="isWishlistOpen = false"
            />
          </div>

          <div v-if="WishlistItems.length" class="space-y-4">
            <div v-for="item in WishlistItems"
                 :key="item.id"
                 class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
              <div class="flex-1">
                <h5 class="font-bold text-zinc-900">{{ item.name }}</h5>
                <p class="text-zinc-600">{{ item.price }}</p>
              </div>
              <button
                  @click="toggleWishlist(item)"
                  class="text-zinc-900 hover:text-red-500 transition-colors"
              >
                <TrashIcon class="h-5 w-5"/>
              </button>
            </div>

            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between text-xl font-bold text-zinc-900">
                <!--                <span>Total:</span>-->
                <!--                <span>${{ calculateTotal() }}</span>-->
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-zinc-600">
            Your wishlist is empty
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-8">
      <div v-for="item in items" :key="item.id"
           class="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-lg">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/3 relative overflow-hidden group">
            <img
                :src="item.img_url"
                :alt="item.name"
                class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div
                class="absolute inset-0 bg-zinc-900 bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20"></div>
          </div>
          <div class="md:w-2/3 p-6 flex flex-col justify-between group">
            <div @click="emit('view-details', item)" class="cursor-pointer">
              <h4 class="text-2xl font-bold text-zinc-900 transform transition-transform duration-300">{{
                  item.name
                }}</h4>
              <p class="text-zinc-900 transition-all">{{ item.description }}</p>
              <p class="text-xl font-bold text-zinc-900">{{ item.date }}</p>
            </div>
            <button
                @click="toggleWishlist(item)"
                class="w-full py-2 rounded-full font-medium transition-colors"
                :class="isInWishlist(item)
                    ? 'bg-zinc-900 text-white duration-600 hover:bg-amber-400 hover:text-zinc-900 hover:scale-102'
                    : 'bg-amber-400 text-zinc-900 duration-600 hover:bg-zinc-900 hover:text-white hover:scale-102'"
            >
              {{ isInWishlist(item) ? 'Remove from Wishlist' : 'Add to Wishlist' }}
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
  </div>
</template>

<script setup>
import  {defineProps, defineEmits, ref, onMounted, onUnmounted, watch} from 'vue'
import {ShoppingCartIcon, XIcon, TrashIcon} from 'lucide-vue-next'

const props = defineProps({
  itemType: {
    type: String,
    required: true
  },
  selectedCategory: {
    type: Number,
    required: false
  }
})

const itemTypeEnum = {
  DISTILLERY: 'distilleries',
  DESTINATION: 'destinations',
  ALCOHOL: 'alcohols'
}

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
    let response
    if(itemTypeEnum[props.itemType] === 'alcohols') {
      response = await fetch(`http://localhost:8080/api/${itemTypeEnum[props.itemType]}?page=${currentPage.value}&category_id=${props.selectedCategory}&size=10&sort=id,desc`)
      console.log(response.url, hasMore.value, currentPage.value, canFetchMore.value, isLoading.value)
    }
    else{
      response = await fetch(`http://localhost:8080/api/${itemTypeEnum[props.itemType]}?page=${currentPage.value}&size=10&sort=id,desc`)
      console.log(response.url)
    }
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

const resetItems = (updatedCategory) => {
  hasMore.value=true
  canFetchMore.value = true

  currentPage.value = 0
  console.log('resetItem',  hasMore.value, currentPage.value, canFetchMore.value, isLoading.value)
  console.log('resetItems', updatedCategory)
  items.value = []
  fetchItems()
}

watch(() => props.selectedCategory, (newValue) => {
  resetItems(newValue);
})



// Retry loading when error occurs
const retryLoading = () => {
  error.value = null
  canFetchMore.value = true
  fetchItems()
}

// Intersection Observer setup
let observer;
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

///
const isWishlistOpen = ref(false)
const WishlistItems = ref([])

// Load Wishlist items from localStorage on mount
onMounted(() => {
  const savedWishlist = localStorage.getItem('Wishlist')
  if (savedWishlist) {
    WishlistItems.value = JSON.parse(savedWishlist)
  }
})

// Watch for changes in Wishlist items and update localStorage
watch(WishlistItems, (newItems) => {
  localStorage.setItem('Wishlist', JSON.stringify(newItems))
}, {deep: true})


const toggleWishlist = (item) => {
  const index = WishlistItems.value.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType)
  if (index === -1) {
    WishlistItems.value.push(item)
  } else {
    WishlistItems.value.splice(index, 1)
  }
}

const isInWishlist = (item) => {
  return WishlistItems.value.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType)
}
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