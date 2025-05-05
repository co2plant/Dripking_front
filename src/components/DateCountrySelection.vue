<script setup>
import { defineEmits, ref, defineProps, onMounted, onUnmounted } from 'vue';
import Trip from '@/composables/Entity/Trip';
import { useTripStore } from "@/stores/useTripStore";

const tripStore = useTripStore();
const emit = defineEmits(['select-country']);

const props = defineProps({
  countries: {
    type: Array,
    required: true
  },
  selectedCountry: {
    type: Number,
    required: true
  }
});

const selectedCountry = ref(props.selectedCountry);
const start_date = ref('');
const end_date = ref('');
const min_start_date = ref('');
const min_end_date = ref('');

const initStartMinDate = () =>{
  const temp = new Date();
  const year = temp.getFullYear();
  const month = ('0' + (temp.getMonth() + 1)).slice(-2);
  const day = ('0' + temp.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}

const initMinEndDate = (inputTemp) => {
  console.log(inputTemp)
  const temp = new Date(inputTemp);
  const year = temp.getFullYear();
  const month = ('0' + (temp.getMonth() + 1)).slice(-2);
  const day = ('0' + (temp.getDate())).slice(-2);

  return `${year}-${month}-${day}`;
}

const selectCountry = (countryId) => {
  emit('select-country', countryId);
};



const createTrip = () => {
  let localLastId = 0
  let today = new Date()
  if (start_date.value === '' || end_date.value === '') {
    alert('여행 날짜를 입력해주세요.')
    return
  }
  if (start_date.value > end_date.value) {
    alert('출발 날짜가 도착 날짜보다 늦을 수 없습니다.')
    return
  }
  if (selectedCountry.value === 0) {
    alert('국가를 선택해주세요.')
    return
  }
  if (start_date.value < today || end_date.value < today) {
    alert('오늘 이후의 날짜를 선택해주세요.')
    return
  }


  for (const item of tripStore.Trips) {
    if (item.itemType === 'TRIP' && item.isLocal) {
      const isConfirm = confirm('이미 여행이 생성되어 있습니다. 작성하던 여행계획을 삭제하고 새로운 여행을 생성하시겠습니까?')
      if (isConfirm) {
        tripStore.removeTrip(item.id)
      }
      else {
        return
      }
    }
  }

  // 로그인이 되어있는 상태라면 db에 저장된 id를 그대로 끌어와서 사용해도됨.
  // VerticalScrollCardList에서는 DB에서 끌어오는 것을 기본으로 사용하기 때문에 현재 로컬에서 사용하는 trip-id와 db trip-id를 구분해야됨 이것을 넣기 위해서는 trip-id 앞에 들어가는 임시적 구분자가 필요 그게 0과 1 <- 0이면 db 로컬이면 1
  // 임시적 구분자에 의해서 로컬과 서버가 구분이 되면 로컬에서는 로컬 trip을 모두 찾아 id순으로 sort하고 가장 마지막 id를 찾아서 +1씩 추가하도록 onMounted에서 제어해야됨

  const newTrip = new Trip()
    .setName('여행' + localLastId)
    .setDescription('설명이 입력되어있지 않습니다.')
    .setStartDate(start_date.value)
    .setEndDate(end_date.value)
    .setIsLocal(true)
    .setCountry(props.countries.find((country) => country.id === selectedCountry.value).name)

  const isPassed = tripStore.addTrip(newTrip);
  if (isPassed) alert('여행이 생성되었습니다.')
  else alert('여행 생성에 실패했습니다. 재시도 해주세요.')
  console.log(tripStore.Trips)
};

onMounted(() => {
  tripStore.loadTrips();
  min_start_date.value = initStartMinDate();
  min_end_date.value = initMinEndDate(min_start_date.value);
});

onUnmounted(() => {
  tripStore.updateTrip();
})
</script>

<template>
  <!-- Date and Country Selection Section -->
  <div class="max-w-[1800px] mx-auto px-4 mb-8 md:mb-12">
    <div class="bg-zinc-50 rounded-lg p-4 md:p-6 shadow-sm">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
        <!-- Date Selection -->
        <div class="space-y-2 md:space-y-3">
          <label class="block text-zinc-900 font-bold text-sm md:text-base">여행 날짜</label>
          <div class="flex gap-2 md:gap-4">
            <div class="flex-1">
              <label class="block text-xs md:text-sm text-zinc-600 mb-1">출발</label>
              <input type="date"
                :min="min_start_date"
                v-model="start_date"
                @change="min_end_date = initMinEndDate(start_date)"
                class="w-full h-11 px-3 md:px-4 py-2 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base">
            </div>
            <div class="flex-1">
              <label class="block text-xs md:text-sm text-zinc-600 mb-1">도착</label>
              <input type="date" 
                :min="min_end_date"
                v-model="end_date"
                class="w-full h-11 px-3 md:px-4 py-2 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base">
            </div>
          </div>
        </div>

        <!-- Country Selection -->
        <div class="space-y-2 md:space-y-3">
          <label class="block text-zinc-900 font-bold text-sm md:text-base">국가 선택</label>
          <div class="flex gap-2 md:gap-4">
            <div class="flex-1">
              <label class="block text-xs md:text-sm text-zinc-600 mb-1">시작 국가</label>
              <select id="country-selection-area" v-model="selectedCountry"
                class="w-full px-3 md:px-4 py-2 h-11 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
                @change="selectCountry(selectedCountry)">
                <option value="0">모든 국가</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Button -->
      <div class="mt-4 md:mt-6 text-center">
        <button @click="createTrip()"
          class="bg-amber-400 text-zinc-900 px-6 md:px-8 py-2 rounded-full hover:bg-amber-500 transition-colors duration-300 text-sm md:text-base">
          생성하기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
