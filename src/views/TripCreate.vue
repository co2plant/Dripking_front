<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-8 flex flex-col gap-3 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-zinc-950">여행 만들기</h1>
        <p class="mt-2 text-sm text-zinc-600">
          여행 기간과 국가를 정한 뒤 위시리스트에 담은 장소를 일정에 추가하세요.
        </p>
      </div>
      <router-link
          :to="{ name: 'destinationList' }"
          class="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        여행지 탐색
      </router-link>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <form
          class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm"
          @submit.prevent="createTrip"
      >
        <div class="grid gap-5">
          <label class="grid gap-2">
            <span class="text-sm font-semibold text-zinc-900">여행 이름</span>
            <input
                v-model.trim="form.name"
                type="text"
                maxlength="60"
                placeholder="예: 교토 양조장 여행"
                class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-zinc-900">설명</span>
            <textarea
                v-model.trim="form.description"
                rows="4"
                placeholder="이번 여행의 목적이나 메모를 적어두세요."
                class="resize-none rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">출발일</span>
              <input
                  v-model="form.startDate"
                  type="date"
                  :min="today"
                  class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  @change="syncEndDate"
              />
            </label>

            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">도착일</span>
              <input
                  v-model="form.endDate"
                  type="date"
                  :min="form.startDate || today"
                  class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
            </label>
          </div>

          <label class="grid gap-2">
            <span class="text-sm font-semibold text-zinc-900">여행 국가</span>
            <select
                v-model.number="form.countryId"
                class="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            >
              <option :value="0">국가를 선택하세요</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.name }}
              </option>
            </select>
          </label>

          <p v-if="errorMessage" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ errorMessage }}
          </p>

          <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <router-link
                :to="{ name: 'destinationList' }"
                class="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              취소
            </router-link>
            <button
                type="submit"
                :disabled="isSubmitting"
                class="inline-flex h-11 items-center justify-center rounded-md bg-amber-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
            >
              {{ isSubmitting ? '생성 중...' : '여행 생성' }}
            </button>
          </div>
        </div>
      </form>

      <aside class="rounded-md border border-zinc-200 bg-zinc-50 p-5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-bold text-zinc-950">내 여행</h2>
          <span class="rounded bg-white px-2 py-1 text-xs font-semibold text-zinc-600">{{ tripStore.Trips.length }}</span>
        </div>

        <div v-if="tripStore.Trips.length" class="mt-4 grid gap-3">
          <router-link
              v-for="trip in tripStore.sortedTrips"
              :key="trip.id"
              :to="{ name: 'tripModify', params: { id: trip.id } }"
              class="rounded-md border border-zinc-200 bg-white p-3 transition-colors hover:border-amber-300"
          >
            <p class="truncate text-sm font-semibold text-zinc-950">{{ trip.name }}</p>
            <p class="mt-1 text-xs text-zinc-500">{{ trip.start_date }} ~ {{ trip.end_date }}</p>
          </router-link>
        </div>

        <p v-else class="mt-4 rounded-md bg-white px-3 py-8 text-center text-sm text-zinc-500">
          아직 만든 여행이 없습니다.
        </p>
      </aside>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from 'vue'
import {useRouter} from 'vue-router'
import Trip from '@/composables/Entity/Trip'
import {apiService} from '@/services/api'
import {useTripStore} from '@/stores/useTripStore'

const router = useRouter()
const tripStore = useTripStore()
const countries = ref([])
const isSubmitting = ref(false)
const errorMessage = ref('')

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = computed(() => formatDateInput(new Date()))

const form = reactive({
  name: '',
  description: '',
  startDate: today.value,
  endDate: today.value,
  countryId: 0,
})

const selectedCountry = computed(() =>
    countries.value.find(country => Number(country.id) === Number(form.countryId))
)

const syncEndDate = () => {
  if (!form.endDate || form.endDate < form.startDate) {
    form.endDate = form.startDate
  }
}

const validateForm = () => {
  if (!form.startDate || !form.endDate) {
    return '여행 날짜를 입력해주세요.'
  }
  if (form.startDate < today.value || form.endDate < today.value) {
    return '오늘 이후의 날짜를 선택해주세요.'
  }
  if (form.startDate > form.endDate) {
    return '출발일이 도착일보다 늦을 수 없습니다.'
  }
  if (!selectedCountry.value) {
    return '여행 국가를 선택해주세요.'
  }
  return ''
}

const createTrip = async () => {
  errorMessage.value = validateForm()
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    const tripName = form.name || `${selectedCountry.value.name} 여행`
    const trip = new Trip()
        .setName(tripName)
        .setDescription(form.description || '설명이 입력되어있지 않습니다.')
        .setStartDate(form.startDate)
        .setEndDate(form.endDate)
        .setIsLocal(true)
        .setCountryId(selectedCountry.value.id)
        .setCountry(selectedCountry.value.name)

    const createdTrip = await tripStore.addTrip(trip)
    if (!createdTrip) {
      errorMessage.value = '여행 생성에 실패했습니다. 재시도 해주세요.'
      return
    }

    await router.push({name: 'tripModify', params: {id: createdTrip.id}})
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await tripStore.loadTrips()
  try {
    countries.value = await apiService.get('countries')
  } catch (error) {
    console.error('Country loading failed:', error)
    errorMessage.value = '국가 목록을 불러오지 못했습니다.'
  }
})
</script>
