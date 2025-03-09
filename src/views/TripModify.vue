<template>
  <div class="container mx-auto p-4">
    <TripInfoEditor
      :tripId="route.params.id"
    />
    <!-- 메인 컨테이너 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-full">
      <div class="lg:col-span-9">
        <div class="bg-white rounded-lg shadow p-4 flex flex-col h-[600px] overflow-auto">
          <div class="flex min-h-[60px] justify-between items-center">
            <h1 class="text-2xl font-bold text-zinc-900">여행 일정</h1>
            <button
                @click="openNewPlanModal"
                class="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-900 rounded-lg flex items-center"
            >
              <plus-icon class="w-5 h-5 mr-2" />
              새 일정 추가
            </button>
          </div>

          <!-- 일정 목록 -->
          <div class="space-y-4 overflow-y-auto flex-grow min-h-[300px]" ref="planContainer">
            <div
                v-for="plan in planStore.Plans"
                :key="plan.id"
                class="plan-item bg-zinc-50 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-4">
                  <grab-icon class="min-w-5 min-h-5 text-zinc-400 cursor-move" />
                  <div class="mx-4">
                    <h3 class="font-semibold text-zinc-900">{{ plan.name }}</h3>
                    <p class="text-sm text-zinc-500 line-clamp-3">{{ plan.description }}</p>
                    <div class="flex items-center space-x-4 text-sm text-zinc-600">
                      <div class="flex items-center">
                        <calendar-icon class="w-4 h-4 mr-1" />
                        {{ formatDate(plan.plan_date) }}
                      </div>
                      <div class="flex items-center">
                        <clock-icon class="w-4 h-4 mr-1" />
                        {{ formatTime(plan.start_time) }} - {{ formatTime(plan.end_time) }}
                      </div>
                      <div class="flex items-center">
                        <map-pin-icon class="w-4 h-4 mr-1" />
                        {{ plan.address }}
                      </div>
                    </div>
                  </div>
                  <!-- 일정이 없을 때 표시할 메시지 -->
                  <div v-if="planStore.Plans.length === 0" class="text-center py-10 text-zinc-500">
                    <calendar-icon class="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                    <p>아직 계획된 일정이 없습니다.</p>
                    <p class="text-sm mt-2">새 일정을 추가하거나 위시리스트에서 드래그하세요.</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4 ml-4">
                  <button
                      @click="editPlan(plan)"
                      class="text-zinc-600 hover:text-zinc-900"
                  >
                    <edit-icon class="w-5 h-5" />
                  </button>
                  <button
                      @click="deletePlan(plan.id)"
                      class="text-zinc-600 hover:text-red-500"
                  >
                    <trash-icon class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow p-4 flex flex-col h-[600px] overflow-auto">
          <div class="flex min-h-[60px] items-center content-center">
            <h2 class="text-lg font-semibold text-zinc-900">위시리스트</h2>
          </div>
          <!-- 위시리스트 목록 -->
          <div class="space-y-4 overflow-y-auto flex-grow min-h-[300px]" ref="wishlistContainer">
            <div
                v-for="item in wishStore.WishItems"
                :key="item.id"
                :data-item-id="item.id"
                :data-item-name="item.name"
                :data-item-description="item.description"
                class="p-3 bg-zinc-50 rounded-lg cursor-move"
            >
              <div class="flex items-center justify-between">
                <span class="text-zinc-900">{{ item.name }}</span>
                <button
                    @click="addWishItemToPlan(item)"
                    class="text-amber-400 hover:text-amber-500"
                >
                  <plus-icon class="w-5 h-5" />
                </button>
              </div>
              <p class="text-sm text-zinc-500 mt-1 line-clamp-2">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 새 일정 추가/수정 모달 -->
    <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click="closeModal"
    >
      <div
          class="bg-white rounded-2xl w-full max-w-md p-6 mx-4"
          @click.stop
          style="max-height: 90vh; overflow-y: auto;"
      >
        <h2 class="text-2xl font-bold text-zinc-900 mb-6 text-center">
          {{ editingPlan ? '일정 수정' : '새 일정 추가' }}
        </h2>

        <form @submit.prevent="savePlan" class="space-y-6">
          <!-- 일정 이름 -->
          <div class="space-y-2">
            <label class="text-base font-medium text-zinc-900">
              일정 이름
            </label>
            <div class="relative">
              <input
                  v-model="currentPlan.name"
                  type="text"
                  required
                  placeholder="예: 도쿄 스카이트리 방문"
                  class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
              />
            </div>
          </div>

          <!-- 설명 -->
          <div class="space-y-2">
            <label class="text-base font-medium text-zinc-900">
              설명
            </label>
            <textarea
                v-model="currentPlan.description"
                rows="3"
                placeholder="일정에 대한 간단한 설명을 입력하세요"
                class="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg resize-none"
            ></textarea>
          </div>

          <!-- 날짜 선택 -->
          <div class="space-y-2">
            <label class="text-base font-medium text-zinc-900">
              날짜
            </label>
            <div class="relative">
              <input
                  v-model="currentPlan.plan_date"
                  type="date"
                  required
                  class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg appearance-none"
              />
            </div>
          </div>

          <!-- 시간 선택 (드롭다운으로 변경) -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-base font-medium text-zinc-900">
                시작 시간
              </label>
              <div class="relative">
                <select
                    v-model="currentPlan.start_time"
                    required
                    class="w-full h-12 px-4 pr-10 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>선택</option>
                  <option v-for="time in timeOptions" :key="time.value" :value="time.value">
                    {{ time.label }}
                  </option>
                </select>
                <clock-icon class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
            </div>
            <div class="space-y-2">
              <label class="text-base font-medium text-zinc-900">
                종료 시간
              </label>
              <div class="relative">
                <select
                    v-model="currentPlan.end_time"
                    required
                    class="w-full h-12 px-4 pr-10 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg appearance-none bg-white cursor-pointer"
                >
                  <option value="" disabled>선택</option>
                  <option v-for="time in timeOptions" :key="time.value" :value="time.value">
                    {{ time.label }}
                  </option>
                </select>
                <clock-icon class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
            </div>
          </div>

          <!-- 주소 -->
          <div class="space-y-2">
            <label class="text-base font-medium text-zinc-900">
              주소
            </label>
            <div class="relative">
              <input
                  v-model="currentPlan.address"
                  type="text"
                  placeholder="장소의 주소를 입력하세요"
                  class="w-full h-12 px-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:ring-amber-400 text-lg"
              />
              <map-pin-icon class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            </div>
          </div>

          <!-- 버튼 그룹 -->
          <div class="flex gap-3 pt-4">
            <button
                type="button"
                @click="closeModal"
                class="flex-1 h-14 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
                type="submit"
                class="flex-1 h-14 rounded-xl bg-amber-400 hover:bg-amber-500 text-zinc-900 text-lg font-medium transition-colors"
            >
              {{ editingPlan ? '저장' : '추가' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, onUnmounted} from 'vue';
import {useRoute} from "vue-router";

import dragula from 'dragula';
import 'dragula/dist/dragula.min.css';

import TripInfoEditor from "@/components/TripInfoEditor.vue";

import {usePlanStore} from "@/stores/usePlanStore";
import {useWishStore} from "@/stores/useWishStore";
import Plan from "@/composables/Entity/Plan";
import {
  Plus as PlusIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  GripVertical as GrabIcon
} from 'lucide-vue-next'


const route = useRoute()
const wishStore = useWishStore();
const planStore = usePlanStore();
// 상태 관리
const showModal = ref(false)
const editingPlan = ref(null)
const currentPlan = ref(new Plan())

// DOM 참조
const wishlistContainer = ref(null)
const planContainer = ref(null)

// Dragula 설정
onMounted(() => {
  planStore.loadPlans();
  wishStore.loadWishlist();

  dragula([wishlistContainer.value, planContainer.value], {
    copy: (el, source) => source === wishlistContainer.value,
    accepts: (el, target) => target === planContainer.value,
    moves: (el) => !el.classList.contains('non-draggable')
  }).on('drop', (el, target) => {
    if (target === planContainer.value) {
      // 위시리스트에서 플랜으로 아이템 이동 처리
      addWishItemToPlan({
        id: el.dataset.itemId,
        name: el.dataset.itemName,
        description: el.dataset.itemDescription
      })
      editPlan(currentPlan.value)
      el.remove() // 복사된 엘리먼트 제거
    }
  })
})
onUnmounted(() => {
  planStore.sortPlans();
  planStore.savePlans();
})

// 시간 옵션 생성 (30분 간격)
const timeOptions = computed(() => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      options.push({
        value: time,
        label: formatTimeLabel(time)
      })
    }
  }
  return options
})

// 시간 레이블 포맷팅
const formatTimeLabel = (time) => {
  const [hour, minute] = time.split(':')
  const hourNum = parseInt(hour)
  const period = hourNum < 12 ? '오전' : '오후'
  const displayHour = hourNum % 12 || 12
  return `${period} ${displayHour}:${minute}`
}

// 날짜 포맷 함수
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 시간 포맷 함수
const formatTime = (time) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// 모달 열기 (새 일정)
const openNewPlanModal = () => {
  editingPlan.value = null
  currentPlan.value = new Plan()
  showModal.value = true
}

// 모달 닫기
const closeModal = () => {
  showModal.value = false
  editingPlan.value = null
  currentPlan.value = new Plan()
}

// 플랜 저장
const savePlan = () => {
  if (editingPlan.value) {
    // 기존 플랜 수정
    const index = planStore.Plans.findIndex(p => p.id === editingPlan.value.id)
    if (index !== -1) {
      planStore.Plans[index] = { ...currentPlan.value }
    }
  } else {
    // 새 플랜 추가
    const newPlan = {
      ...currentPlan.value,
      id: Date.now().toString()
    }
    planStore.addPlan(newPlan);
    planStore.savePlans();
  }
  closeModal()
}

// 플랜 수정
const editPlan = (plan) => {
  editingPlan.value = plan
  currentPlan.value = { ...plan }
  showModal.value = true
}

// 플랜 삭제
const deletePlan = (id) => {
  if (confirm('이 일정을 삭제하시겠습니까?')) {
    planStore.removePlan(id);
    planStore.savePlans();
  }
}

// 위시리스트 아이템을 플랜으로 추가
const addWishItemToPlan = (item) => {
  currentPlan.value = new Plan()
      .setName(item.name)
      .setDescription(item.description)
      .setPlanDate(new Date().toISOString().slice(0, 10))
      .setStartTime('09:00')
      .setEndTime('18:00')
      .setPlaceId(item.id)
      .setTripId(route.params.id)
      .build();
  planStore.addPlan(currentPlan.value)
  planStore.savePlans();
}

</script>

<style>
/* Dragula 스타일 */
.gu-mirror {
  @apply fixed !important;
  @apply bg-white;
  @apply rounded-lg;
  @apply shadow-lg;
  @apply border-2;
  @apply border-amber-400;
  @apply opacity-90;
  @apply z-50;
}

.gu-hide {
  display: none !important;
}

.gu-unselectable {
  user-select: none !important;
}

.gu-transit {
  @apply opacity-20;
  @apply bg-zinc-100;
}

/* 폼 입력 필드 공통 스타일 */
input[type="text"],
input[type="date"],
input[type="time"],
textarea {
  @apply px-3 py-2;
}

/* 드롭다운 스타일 추가 */
select {
  background-image: none;
}

/* 모바일 최적화를 위한 추가 스타일 */
@media (max-width: 640px) {
  input[type="date"],
  input[type="time"] {
    font-size: 16px; /* iOS 내에서 자동 확대 방지 */
  }

  /* 네이티브 달력/시간 선택 UI 스타일링 */
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
  }

  select {
    font-size: 16px;
  }

  /* 네이티브 드롭다운 UI 개선 */
  select:focus {
    @apply ring-2 ring-amber-400 ring-opacity-50;
  }
}

/* 입력 필드 포커스 시 하이라이트 효과 */
input:focus,
textarea:focus {
  @apply ring-2 ring-amber-400 ring-opacity-50;
}

/* 터치 영역 최적화 */
button,
input,
textarea {
  @apply touch-manipulation;
}
</style>

