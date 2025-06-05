<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="space-y-2" style="flex: 1;">
        <div v-if="!isEditing">
          <h1 class="text-3xl font-bold text-zinc-900">{{ trip?.name }}</h1>
          <p class="text-zinc-600">{{ trip?.description }}</p>
          <div class="flex items-center text-zinc-700 mt-2">
            <calendar-icon class="w-5 h-5 mr-2 text-amber-400" />
            <span>{{ trip?.start_date }} ~ {{ trip?.end_date }}</span>
            <span class="mx-2"></span>
            <map-pin-icon class="w-5 h-5 mr-2 text-amber-400" />
            <span>{{ trip?.country }}</span>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1">여행 이름</label>
            <input 
              v-model="editingTrip.name" 
              type="text" 
              class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
              placeholder="여행 이름을 입력하세요"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1">설명</label>
            <textarea 
              v-model="editingTrip.description" 
              rows="3"
              class="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg resize-none"
              placeholder="여행에 대한 설명을 입력하세요"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1">시작일</label>
              <input 
                v-model="editingTrip.start_date" 
                type="date" 
                class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1">종료일</label>
              <input 
                v-model="editingTrip.end_date" 
                type="date" 
                class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-zinc-700 mb-1">국가</label>
              <input 
                v-model="editingTrip.country" 
                type="text" 
                class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
                placeholder="여행 국가를 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3">
        <button class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg flex items-center justify-center">
          <share-icon class="w-5 h-5 mr-2" />
          공유하기
        </button>
        
        <button
            v-if="!isEditing"
            @click="startEditing"
            class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg flex items-center justify-center">
          <edit-icon class="w-5 h-5 mr-2" />
          여행 정보 수정
        </button>
        
        <div v-else class="flex gap-2">
          <button
              @click="cancelEditing"
              class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg flex items-center justify-center">
            <x-icon class="w-5 h-5 mr-2" />
            취소
          </button>
          
          <button
              @click="saveTrip"
              class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg flex items-center justify-center">
            <save-icon class="w-5 h-5 mr-2" />
            저장
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100">
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ trip ? trip.getDuration() : 0 }} 일</p>
        <p class="text-zinc-600 text-sm">총 여행일</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ (planStore.Plans.filter(plan => plan.trip_id === props.id)).length }}</p>
        <p class="text-zinc-600 text-sm">일정 수</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ wishStore.WishItems.length }}</p>
        <p class="text-zinc-600 text-sm">위시리스트</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-amber-400">{{ calculateCompletionPercentage() }}%</p>
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
  X as XIcon
} from 'lucide-vue-next'
import {useWishStore} from "@/stores/useWishStore";
import {usePlanStore} from "@/stores/usePlanStore";
import {useTripStore} from "@/stores/useTripStore";

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const tripStore = useTripStore();
const wishStore = useWishStore();
const planStore = usePlanStore();

const trip = ref();
const isEditing = ref(false);
const editingTrip = ref({});

const startEditing = () => {
  if (trip.value) {
    editingTrip.value = JSON.parse(JSON.stringify(trip.value));
    isEditing.value = true;
  } else {
    alert('여행 정보를 불러올 수 없어 편집할 수 없습니다.');
    console.error('Cannot start editing because trip data is undefined.');
  }
}

const cancelEditing = () => {
  isEditing.value = false;
}

const saveTrip = async () => {
  if (trip.value) {
    try {
      const success = await tripStore.updateTrip(trip.value.id, editingTrip.value);
      if (success) {
        isEditing.value = false;
      } else {
        alert('여행 정보 수정에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('여행 정보 수정 중 오류 발생:', error);
      alert('여행 정보 수정 중 오류가 발생했습니다.');
    } finally {
      trip.value = tripStore.findTripById((props.id).toString());
    }
  }
}

const calculateCompletionPercentage = () => {
  if (!trip.value) return 0;

  const planCount = planStore.Plans.filter(plan => plan.trip_id === props.id).length;
  const duration = trip.value.getDuration();

  if (duration <= 0) return 0;
  
  const percentage = Math.min(Math.round((planCount / duration) * 100), 100);
  return percentage;
};

onMounted(() => {
  tripStore.loadTrips();
  trip.value = tripStore.findTripById(props.id);
})
</script>


<style scoped>
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-amber-400 ring-opacity-50;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  color: rgba(0, 0, 0, 0);
  opacity: 1;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFC107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' y1='2' x2='16' y2='6'%3E%3C/line%3E%3Cline x1='8' y1='2' x2='8' y2='6'%3E%3C/line%3E%3Cline x1='3' y1='10' x2='21' y2='10'%3E%3C/line%3E%3C/svg%3E") no-repeat center;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

@media (max-width: 640px) {
  input[type="date"] {
    font-size: 16px; 
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
