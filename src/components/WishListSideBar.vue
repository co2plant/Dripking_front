<template>
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
          <span v-if="wishStore.WishItems.length"
                class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="isWishlistOpen = true">
                      {{ wishStore.WishItems.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Wishlist Sidebar -->
    <div v-if="isWishlistOpen"
         class="fixed inset-0 bg-black bg-opacity-50 z-50"
         @click="isWishlistOpen = false">
      <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6"
           @click.stop
           ref="sidebarPanel">
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-xl font-bold text-zinc-900">Wishlist</h4>
          <XIcon
              class="h-6 w-6 text-zinc-900 cursor-pointer"
              @click="isWishlistOpen = false"
          />
        </div>
        <div class="h-full overflow-auto">
          <div v-if="wishStore.WishItems.length" class="space-y-4 wrapper">
            <div
                v-if="tripStore.Trips.length === 0"
                class="grid grid-cols-1 items-center gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <span class="font-bold text-zinc-900">여행 계획</span>
              <p class="text-sm text-zinc-600">
                위시리스트 항목을 일정에 넣으려면 먼저 여행 날짜와 국가를 선택해 여행을 생성해주세요.
              </p>
              <router-link
                  :to="{ name: 'tripCreate' }"
                  @click="isWishlistOpen = false"
                  class="inline-flex justify-center rounded-full bg-amber-400 px-6 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-500"
              >
                여행 생성하러 가기
              </router-link>
            </div>
            <div v-for="item_trip in tripStore.Trips"
                 :key="item_trip.id"
                 :id="item_trip.id"
                 class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg relative">
              <!-- Delete Trip Button -->
              <button
                  @click="deleteAllPlansByTripId(item_trip.id)"
                  class="absolute top-2 right-2 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label="Delete trip"
              >
                <XIcon class="h-5 w-5"/>
              </button>

              <span class="font-bold text-zinc-900">{{ item_trip.name }}</span>
              <span class="text-zinc-600">{{ item_trip.start_date }} ~ {{ item_trip.end_date }}</span>
              <div class="dragula-container container min-h-24" :data-trip-id="item_trip.id">
                <div v-for="item in getTripPlans(item_trip.id)"
                     :key="item.id"
                     :data-item-id="item.id"
                     :data-item-trip-id="item.trip_id"
                     :data-plan-id="item.id"
                     class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                  <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                    <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <button
                      @click="deletePlanById(item.id)"
                      class="text-zinc-900 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon class="h-5 w-5"/>
                  </button>
                </div>
              </div>
              <div class="mt-4 md:mt-6 text-center">
                <router-link :to="{ name : 'tripModify', params : {id: item_trip.id}}">
                  <button
                      class="bg-amber-400 text-zinc-900 px-6 md:px-8 py-2 rounded-full hover:bg-amber-500 transition-colors duration-300 text-sm md:text-base"
                  >
                    다음
                  </button>
                </router-link>
              </div>
            </div>
            <div id="item_trip-1"
                 class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg">
              <span class="font-bold text-zinc-900"> Wish </span>
              <div class="dragula-container min-h-24" :data-trip-id="-1">
                <div v-for="item in wishStore.WishItems"
                     :key="item.id"
                     :data-item-id="item.id"
                     :data-item-type="item.itemType"
                     :data-item-trip-id="item.trip_id"
                     class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                  <img :src="item.img_url" :alt="item.name" class="w-20 h-20 shrink-0 object-cover rounded">
                  <div class="min-w-0 flex-1 px-4">
                    <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                    <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <button
                      v-if="getDetailRouteForItem(item)"
                      type="button"
                      @click.stop="openWishlistItem(item)"
                      class="mr-3 shrink-0 text-zinc-600 hover:text-zinc-900 transition-colors"
                      aria-label="상세 보기"
                      title="상세 보기"
                  >
                    <ExternalLinkIcon class="h-5 w-5"/>
                  </button>
                  <button
                      type="button"
                      @click.stop="wishStore.toggleWishlist(item, item.itemType)"
                      class="shrink-0 text-zinc-900 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon class="h-5 w-5"/>
                  </button>
                </div>
              </div>
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
    </div>
  </section>
</template>

<script setup>
import {nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {ShoppingCartIcon, XIcon, TrashIcon, ExternalLink as ExternalLinkIcon} from 'lucide-vue-next';
import {useRouter} from 'vue-router';
import dragula from 'dragula';
import 'dragula/dist/dragula.min.css';
import {useTripStore} from "@/stores/useTripStore";
import {useWishStore} from "@/stores/useWishStore";
import {usePlanStore} from "@/stores/usePlanStore";
import {useAuthStore} from "@/stores/useAuthStore";
import Plan from "@/composables/Entity/Plan";
import {normalizeCoordinates} from "@/utils/coordinates";
import {getDetailRouteForItem} from "@/utils/detailRoutes";

const router = useRouter();
const tripStore = useTripStore();
const wishStore = useWishStore();
const planStore = usePlanStore();
const authStore = useAuthStore();
const isWishlistOpen = ref(false);
const sidebarPanel = ref(null);
let drake = null;

const sortOrderValue = (plan) => {
  const sortOrder = Number(plan.sort_order)
  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER
}

const comparePlanOrder = (a, b) => {
  const sortOrderDiff = sortOrderValue(a) - sortOrderValue(b)
  if (sortOrderDiff !== 0) return sortOrderDiff
  const dateDiff = String(a.plan_date || '').localeCompare(String(b.plan_date || ''))
  if (dateDiff !== 0) return dateDiff
  const startTimeDiff = String(a.start_time || '').localeCompare(String(b.start_time || ''))
  if (startTimeDiff !== 0) return startTimeDiff
  return String(a.id).localeCompare(String(b.id))
}

const getTripPlans = (tripId) => planStore.Plans
    .filter(plan => String(plan.trip_id) === String(tripId))
    .sort(comparePlanOrder)

const nextSortOrderForTrip = (tripId) => {
  const sortOrders = getTripPlans(tripId)
      .map(plan => Number(plan.sort_order))
      .filter(Number.isFinite)
  if (sortOrders.length === 0) {
    return getTripPlans(tripId).length
  }
  return Math.max(...sortOrders) + 1
}

const openWishlistItem = async (item) => {
  const detailRoute = getDetailRouteForItem(item)
  if (!detailRoute) return

  isWishlistOpen.value = false
  await router.push(detailRoute)
}

const findTrip = (tripId) => tripStore.Trips.find(trip => String(trip.id) === String(tripId))

const addWishlistItemToTrip = async (item, tripId) => {
  if (!item || !tripId) return null

  const trip = findTrip(tripId)
  const coordinates = normalizeCoordinates(item)
  const plan = new Plan()
      .setName(item.name)
      .setDescription(item.description)
      .setPlanDate(trip?.start_date || new Date().toISOString().slice(0, 10))
      .setStartTime('09:00')
      .setEndTime('18:00')
      .setPlaceId(item.id)
      .setTripId(tripId)
      .setLatitude(coordinates.latitude)
      .setLongitude(coordinates.longitude)
      .setPlaceName(item.name || null)
      .setAddress(item.address || null)
      .setItemType(item.itemType)
      .build()

  plan.sort_order = nextSortOrderForTrip(tripId)
  const addedPlan = await planStore.addPlan(plan)
  if (!addedPlan) {
    alert('위시리스트 항목을 일정에 추가하지 못했습니다. 잠시 후 다시 시도해주세요.')
  }
  return addedPlan
}

const destroyWishlistDrag = () => {
  drake?.destroy()
  drake = null
}

const initWishlistDrag = async () => {
  await nextTick()
  destroyWishlistDrag()

  const containers = Array.from(sidebarPanel.value?.querySelectorAll('.dragula-container') || [])
  if (containers.length < 2) return

  drake = dragula(containers, {
    copy: (el, source) => source.dataset.tripId === '-1',
    accepts: (el, target, source) => source.dataset.tripId === '-1' && target.dataset.tripId !== '-1',
    moves: (el, source, handle) => source.dataset.tripId === '-1' && !handle?.closest('button'),
  }).on('drop', async (el, target, source) => {
    if (!target || source.dataset.tripId !== '-1') return

    const item = wishStore.WishItems.find(wishItem =>
        String(wishItem.id) === String(el.dataset.itemId) && wishItem.itemType === el.dataset.itemType
    )
    await addWishlistItemToTrip(item, target.dataset.tripId)
    el.remove()
  })
}

watch(isWishlistOpen, async (isOpen) => {
  if (isOpen) {
    await initWishlistDrag()
    return
  }

  destroyWishlistDrag()
})

onMounted(async () => {
  await tripStore.loadTrips();
  if (authStore.isAuthenticated()) {
    for (const trip of tripStore.Trips) {
      await planStore.loadPlans(trip.id);
    }
  } else {
    await planStore.loadPlans();
  }
  await wishStore.loadWishlist();
  if (isWishlistOpen.value) {
    await initWishlistDrag()
  }
});

onUnmounted(() => {
  destroyWishlistDrag()
  wishStore.WishItems = wishStore.sortWishlist();
  wishStore.saveWishlist();
})

const deletePlanById = async (plan_id) => {
  await planStore.removePlan(plan_id);
}

const deleteAllPlansByTripId = async (trip_id) => {
  await planStore.clearPlansByTripId(trip_id);
  await tripStore.removeTrip(trip_id);
}
</script>

<style scoped>

</style>
