<template>
  <div class="relative max-w-5xl mx-auto px-4" ref="listContainer">
    <section class="py-16 bg-white">
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
                  class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {{ WishlistItems.length }}
          </span>
          </div>
        </div>


        <div class="gap-8">
          <div v-for="item in items" :key="item.id"
               class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4">
            <div class="relative overflow-hidden w-1/4">
              <img :src="item.img_url" :alt="item.name"
                   class="w-full h-80 object-cover transform group-hover:scale-105 transition duration-500">
              <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition">
                <div class="absolute bottom-4 left-4 right-4">
                  <button
                      @click="toggleWishlist(item)"
                      class="w-full py-2 rounded-full font-medium transition-colors"
                      :class="isInWishlist(item.id)
                    ? 'bg-zinc-900 text-white'
                    : 'bg-amber-400 text-zinc-900'"
                  >
                    {{ isInWishlist(item.id) ? 'Remove from WishList' : 'Add to Wishlist' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="p-4 w-3/4 px-4 flex flex-col">
              <h4 class="text-xl font-bold text-zinc-900">{{ item.name }}</h4>
              <p class="text-zinc-600">{{ item.description }}</p>
            </div>
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
              <img :src="item.image" :alt="item.name" class="w-20 h-20 object-cover rounded">
              <div class="flex-1">
                <h5 class="font-bold text-zinc-900">{{ item.name }}</h5>
                <p class="text-zinc-600">{{ item.price }}</p>
              </div>
              <button
                  @click="toggleWishlist(item)"
                  class="text-zinc-900 hover:text-red-500 transition-colors"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>

            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between text-xl font-bold text-zinc-900">
                <span>Total:</span>
                <span>${{ calculateTotal() }}</span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-zinc-600">
            Your wishlist is empty
          </div>
        </div>
      </div>
    </section>

    <!-- List Container -->
    <div class="space-y-6">
      <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center gap-4"
      >
        <div class="flex-shrink-0 w-1/4 overflow-hidden" @click="emit('view-details', item)">
          <img
              :src="item.img_url || '/placeholder.svg?height=128&width=192'"
              :alt="item.title"
              class="w-full h-full rounded-lg object-cover transform group-hover:scale-105 transition duration-500"
          />
        </div>

        <div class="w-3/4 px-4 flex flex-col">
          <div class="flex-grow ml-6">
            <h2 class="text-2xl font-semibold text-left mb-2 h-1/4" @click="emit('view-details', item)">{{
                item.name
              }}</h2>
            <p class="text-zinc-600 text-left mb-4 line-clamp-3 h-2/4" @click="emit('view-details', item)">
              {{ item.description }}</p>
            <div class="flex justify-between items-center h-1/4">
              <p class="text-zinc-500 text-left text-sm">date</p>
              <button
                  :class="[
                      'bottom-4 right-4 w-10 h-10  rounded-lg flex items-center text-white justify-center transition-colors duration-200',
                      isDuplicatePlan(item)
                      ?'bg-amber-400 hover:bg-amber-600'
                      :'bg-zinc-600 hover:bg-zinc-700 focus:ring-zinc-600'
                  ]"
                  @click="toggleWishlist(item)"
              >
                {{ isInWishlist(item.id) ? 'Remove from WishList' : 'Add to Wishlist' }}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

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
import {defineProps, defineEmits, ref, onMounted, onUnmounted, watch} from 'vue'
import {ShoppingCartIcon, XIcon, TrashIcon} from 'lucide-vue-next'

const props = defineProps({
  itemType: {
    type: String,
    required: true
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
    const response = await fetch(`api/${itemTypeEnum[props.itemType]}?page=${currentPage.value}&size=10&sort=id,desc`)
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

const clearExpiredPlan = (plan) => {
  for (let i in plan) {
    if (plan[i].expire < Date.now()) {
      plan.splice(i, 1);
    }
  }
}
//중복 확인 부 추가
const isDuplicatePlan = (item) => {
  let plan = JSON.parse(localStorage.getItem('plan')) || [];
  for (let i in plan) {
    if (plan[i].value.itemType == props.itemType && plan[i].value.id === item.id) {
      return true;
    }
  }
  return false;
}

//중복을 모두 삭제하는 것
// const deleteDuplicatePlan = (plan, item) => {
//   for (let i in plan) {
//     if (plan[i].value.itemType == props.itemType && plan[i].value.id === item.id) {
//       plan.splice(i, 1);
//       i = 0
//     }
//   }
// }

// const addToPlan = (item) => {
//   //만료일자 확인 부
//   let plan = JSON.parse(localStorage.getItem('plan')) || [];
//
//   clearExpiredPlan(plan);
//
//   if(isDuplicatePlan(item)){
//     deleteDuplicatePlan(plan, item);
//   }else{
//     // 일단 장바구니 처럼 전부다 담는 기능으로.
//     const obj = {
//       value: item,
//       expire: Date.now() + 1000 * 60 * 60 * 24
//     }
//     plan.push(obj);
//   }
//   localStorage.setItem('plan', JSON.stringify(plan));
// }


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
  clearExpiredPlan(JSON.parse(localStorage.getItem('plan')) || []);
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
}, { deep: true })

const toggleWishlist = (product) => {
  const index = WishlistItems.value.findIndex(item => item.id === product.id)
  if (index === -1) {
    WishlistItems.value.push(product)
  } else {
    WishlistItems.value.splice(index, 1)
  }
}

const isInWishlist = (productId) => {
  return WishlistItems.value.some(item => item.id === productId)
}

const calculateTotal = () => {
  return WishlistItems.value
      .reduce((total, item) => total + parseFloat(item.price.replace('$', '')), 0)
      .toFixed(2)
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

