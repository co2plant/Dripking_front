<template>
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold text-zinc-900">{{ trip.name }}</h1>
      <p class="text-zinc-600">{{ trip.description }}</p>
      <div class="flex items-center text-zinc-700 mt-2">
        <calendar-icon class="w-5 h-5 mr-2 text-amber-400" />
        <span>{{ trip.start_date }} ~ {{trip.end_date}}</span>
        <span class="mx-2">•</span>
        <map-pin-icon class="w-5 h-5 mr-2 text-amber-400" />
        <span>{{ trip.destination }}</span>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <button class="px-4 pyx-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg flex items-center justify-center">
        <share-icon class="w-5 h-5 mr-2" />
        공유하기
      </button>
      <button
          v-if="!isEditing"
          @click="editTrip()"
          class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg flex items-center justify-center">
        <edit-icon class="w-5 h-5 mr-2" />
        여행 정보 수정
      </button>
      <button
          v-else
          @click="editTrip()"
          class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg flex items-center justify-center">
        <save-icon class="w-5 h-5 mr-2" />
        변경 사항 저장
      </button>
    </div>
  </div>
  <!-- 여행 요약 정보 섹션 -->
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <!-- 여행 통계 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100">
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ trip.getDuration() }} 일</p>
        <p class="text-zinc-600 text-sm">총 여행일</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ (planStore.Plans.filter(plan => plan.trip_id === props.tripId)).length }}</p>
        <p class="text-zinc-600 text-sm">일정 수</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ wishStore.WishItems.length }}</p>
        <p class="text-zinc-600 text-sm">위시리스트</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{  }}%</p>
        <p class="text-zinc-600 text-sm">계획 완성도</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, onMounted} from "vue";
import {
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Save as SaveIcon,
} from 'lucide-vue-next'
import {useWishStore} from "@/stores/useWishStore";
import {usePlanStore} from "@/stores/usePlanStore";
import {useTripStore} from "@/stores/useTripStore";

const props = defineProps({
  tripId: {
    type: String,
    required: true
  }
})

const tripStore = useTripStore();
const wishStore = useWishStore();
const planStore = usePlanStore();

const trip = tripStore.findTripById((props.tripId).toString());
const isEditing = ref(false);

const editTrip = () => {
  isEditing.value = !isEditing.value
}

onMounted(() => {
  tripStore.loadTrips()
})
</script>


<style scoped>

</style>