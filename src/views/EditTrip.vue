<template>
  <div class="min-h-screen bg-white py-4 md:py-8">
    <!-- Header -->
    <div class="max-w-[1800px] mx-auto px-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-zinc-900"> {{tripItem.name}} </h1>
        <div class="flex gap-2">
          <button
              v-for="view in views"
              :key="view.id"
              @click="currentView = view.id"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="currentView === view.id
              ? 'bg-amber-400 text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
          >
            <component :is="view.icon" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Trip Details -->
      <div class="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4 md:items-center">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <CalendarIcon class="w-5 h-5 text-zinc-600" />
              <span class="text-zinc-900">{{ tripItem.start_date }} ~ {{ tripItem.end_date }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPinIcon class="w-5 h-5 text-zinc-600" />
              <span class="text-zinc-900"> {{ tripItem.country }} </span>
            </div>
          </div>
          <button class="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors">
            여행 정보 수정
          </button>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-if="currentView === 'calendar'" class="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div v-for="day in days"
               :key="day.date" class="border rounded-lg p-4">
            <h3 class="font-bold text-lg mb-4">{{ day.date }}</h3>
            <div
                :data-date="day.date"
                class="trip-container min-h-[100px] space-y-2"
            >
              <div
                  v-for="item in WishlistItems.filter((i) => i.itemType !== 'TRIP' &&  i.trip_id === route.params.id)"
                  :key="item.id"
                  :data-id="item.id"
                  class="bg-amber-50 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
              >
                <div class="flex gap-3">
                  <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded object-cover">
                  <div class="flex-1">
                    <h4 class="font-medium text-zinc-900">{{ item.name }}</h4>
                    <p class="text-sm text-zinc-600 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <button @click="toggleWishlist(item)" class="text-zinc-400 hover:text-red-500">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div class="space-y-4">
          <div v-for="item_trip in WishlistItems.filter((i) => i.itemType === 'TRIP')"
               :key="item_trip.id"
               :id="'item_trip' + item_trip.id">
            <h3 class="font-bold text-lg mb-3">{{ item_trip.date }}</h3>
            <div
                :data-date="item_trip.date"
                class="trip-container space-y-2 min-h-32"
            >
              <div
                  v-for="item in WishlistItems.filter((i) => i.itemType !== 'TRIP' &&  i.trip_id === route.params.id)"
                  :key="item.id"
                  :data-id="item.id"
                  class="bg-amber-50 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
              >
                <div class="flex gap-4">
                  <img :src="item.img_url" :alt="item.name" class="w-24 h-24 rounded object-cover">
                  <div class="flex-1">
                    <h4 class="font-medium text-zinc-900 mb-2">{{ item.name }}</h4>
                    <p class="text-zinc-600">{{ item.description }}</p>
                    <div class="mt-2 flex gap-2 text-sm text-zinc-500">
                      <span>예상 소요시간: {{ item.duration }}</span>
                      <span>추천 시간대: {{ item.recommendedTime }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button @click="removeFromTrip(item)" class="text-zinc-400 hover:text-red-500">
                      <TrashIcon class="w-5 h-5" />
                    </button>
                    <button @click="editItem(item)" class="text-zinc-400 hover:text-amber-500">
                      <PencilIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Unassigned Items -->
      <div class="bg-white rounded-lg shadow-lg p-4">
        <h3 class="font-bold text-lg mb-4">미배정 항목</h3>
        <div class="trip-container grid grid-cols-1 md:grid-cols-2 gap-4 min-h-32" data-date="unassigned">
          <div
              v-for="item in WishlistItems.filter((i) => i.itemType !== 'TRIP' &&  -1 === i.trip_id)"
              :key="item.id"
              :data-item-id="item.id"
              :data-item-trip_id="item.trip_id"
              class="bg-amber-50 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
          >
            <div class="flex gap-4">
              <img :src="item.img_url" :alt="item.name" class="w-20 h-20 rounded object-cover">
              <div class="flex-1">
                <h4 class="font-medium text-zinc-900">{{ item.name }}</h4>
                <p class="text-sm text-zinc-600 line-clamp-2">{{ item.description }}</p>
              </div>
              <button @click="toggleWishlist(item)" class="text-zinc-400 hover:text-red-500">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted} from 'vue'
import { CalendarIcon, MapPinIcon, ListIcon, TrashIcon, PencilIcon } from 'lucide-vue-next'
import {useRoute} from 'vue-router'
//import { dragula } from 'dragula'
import { useWishlist } from "@/composables/useWishlist";

const { WishlistItems, toggleWishlist } = useWishlist();
//, toggleWishlistUpdatePlanID
const currentView = ref('calendar')
const drake = ref(null)
const tripItem = ref([])
const days = ref([])
const route = useRoute()

const views = [
  { id: 'calendar', icon: CalendarIcon },
  { id: 'list', icon: ListIcon }
]

const initTripItem = (item_id) => {
  tripItem.value = WishlistItems.value.find((i) => i.itemType === 'TRIP' && i.id == item_id)
}

const initDays = () => {
  try{
    const period = (new Date(tripItem.value.end_date) - new Date(tripItem.value.start_date)) / (1000 * 60 * 60 * 24)
    for(let i = 0; i <period; i++){
      const date = new Date(tripItem.value.start_date)
      date.setDate(date.getDate() + i)
      days.value.push({
        date: date.toISOString().slice(0, 10),
        items: []
      })
    }
  }catch(e){
    console.error(e)
  }

}

onMounted(() => {
  //initDragula()
  initTripItem(route.params.id)
  initDays()
})

onUnmounted(() => {
  if (drake.value) {
    drake.value.destroy()
  }
})


// const initDragula = () => {
//   drake.value = dragula(
//       Array.from(document.querySelectorAll('.trip-container')),
//       {
//           moves: (el, container, handle) => {
//
//           return !handle.classList.contains('no-drag')
//         },
//         accepts: () => {
//           return true // 모든 컨테이너 간 이동 허용
//         }
//       }
//   )
//
//   drake.value.on('drop', (el, target) => {
//     const tripId = target.getAttribute('data-trip-id');
//     const itemId = el.getAttribute('data-item-id')
//     const itemTripId = el.getAttribute('data-item-trip_id');
//
//     if (tripId !== null && itemTripId !== null) {
//       toggleWishlistUpdatePlanID(itemTripId, itemId, tripId);
//     } else {
//       console.error('Failed to get tripId or itemTripId');
//     }
//   })
// }
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Dragula 관련 스타일 */
.gu-mirror {
  position: fixed !important;
  margin: 0 !important;
  z-index: 9999 !important;
  opacity: 0.8;
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";
  filter: alpha(opacity=80);
}

.gu-hide {
  display: none !important;
}

.gu-unselectable {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
}

.gu-transit {
  opacity: 0.2;
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";
  filter: alpha(opacity=20);
}
</style>