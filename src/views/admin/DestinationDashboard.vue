<template>
  <div class="container mx-auto">
    <div class="flex min-h-screen flex-col space-y-6">
      <div class="container grid flex-1 gap-12">
        <main class="flex w-full flex-1 flex-col overflow-hidden">
          <div class="flex flex-col gap-4 md:gap-6">
            <div class="grid gap-1">
              <h1 class="text-2xl font-bold tracking-tight">목적지 관리</h1>
              <p class="text-zinc-500 dark:text-zinc-400">여행 목적지 정보를 관리합니다.</p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between">
                <h2 class="text-xl font-bold">목적지 목록</h2>
                <button
                    @click="openAddModal"
                    class="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                >
                  <MapPin class="mr-2 h-4 w-4" />
                  목적지 추가
                </button>
              </div>

              <div class="flex items-center py-4">
                <input
                    v-model="searchQuery"
                    placeholder="이름으로 검색..."
                    class="max-w-sm rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>

              <div class="rounded-md border">
                <table class="w-full">
                  <thead>
                  <tr class="border-b bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <th v-for="column in columns" :key="column.key" class="px-4 py-3 text-left text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {{ column.label }}
                    </th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      작업
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                      v-for="destination in filteredDestinations"
                      :key="destination.id"
                      class="border-b dark:border-zinc-800"
                  >
                    <td class="px-4 py-3 text-sm">{{ destination.name }}</td>
                    <td class="px-4 py-3 text-sm">{{ destination.country }}</td>
                    <td class="px-4 py-3 text-sm">{{ destination.city }}</td>
                    <td class="px-4 py-3 text-sm">
                      <div class="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        {{ destination.category }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center">
                        <div class="h-2 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700">
                          <div
                              class="h-2 rounded-full bg-amber-500"
                              :style="{ width: `${(destination.popularity / 10) * 100}%` }"
                          />
                        </div>
                        <span class="ml-2 text-sm">{{ destination.popularity }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right text-sm">
                      <div class="relative">
                        <button @click="toggleDropdown(destination.id)" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                          <MoreHorizontal class="h-4 w-4" />
                        </button>
                        <div v-if="activeDropdown === destination.id" class="absolute right-0 z-10 mt-2 w-36 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                          <div class="py-1 text-sm text-zinc-700 dark:text-zinc-300">
                            <div class="border-b border-zinc-200 px-3 py-2 font-medium dark:border-zinc-800">작업</div>
                            <button @click="openEditModal(destination)" class="flex w-full items-center px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <Pencil class="mr-2 h-4 w-4" />
                              <span>편집</span>
                            </button>
                            <button @click="openDeleteModal(destination)" class="flex w-full items-center px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <Trash2 class="mr-2 h-4 w-4" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredDestinations.length === 0">
                    <td colspan="6" class="h-24 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      데이터가 없습니다.
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <div class="flex items-center justify-end space-x-2 py-4">
                <button
                    @click="prevPage"
                    :disabled="currentPage <= 1"
                    class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  이전
                </button>
                <button
                    @click="nextPage"
                    :disabled="currentPage >= totalPages"
                    class="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- 목적지 추가/편집 모달 -->
      <Teleport to="body">
        <div v-if="isFormModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-950">
            <div class="mb-4">
              <h2 class="text-lg font-semibold">{{ modalTitle }}</h2>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                목적지 정보를 입력하세요. 완료되면 저장 버튼을 클릭하세요.
              </p>
            </div>

            <form @submit.prevent="submitForm" class="space-y-4">
              <div class="space-y-2">
                <label for="destination_name" class="text-sm font-medium">이름</label>
                <input
                    id="destination_name"
                    v-model="formData.name"
                    placeholder="목적지 이름"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
                <p v-if="formErrors.name" class="text-xs text-red-500">{{ formErrors.name }}</p>
              </div>

              <div class="space-y-2">
                <label for="destination_country" class="text-sm font-medium">국가</label>
                <input
                    id="destination_country"
                    v-model="formData.country"
                    placeholder="국가명"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
                <p v-if="formErrors.country" class="text-xs text-red-500">{{ formErrors.country }}</p>
              </div>

              <div class="space-y-2">
                <label for="destination_city" class="text-sm font-medium">도시</label>
                <input
                    id="destination_city"
                    v-model="formData.city"
                    placeholder="도시명"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
                <p v-if="formErrors.city" class="text-xs text-red-500">{{ formErrors.city }}</p>
              </div>

              <div class="space-y-2">
                <label for="destination_category" class="text-sm font-medium">카테고리</label>
                <select
                    id="destination_category"
                    v-model="formData.category"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="명소">명소</option>
                  <option value="역사">역사</option>
                  <option value="자연">자연</option>
                  <option value="문화">문화</option>
                  <option value="음식">음식</option>
                </select>
              </div>

              <div class="space-y-2">
                <label for="destination_rating" class="text-sm font-medium">인기도 ({{ formData.popularity.toFixed(1) }})</label>
                <input
                    id="destination_rating"
                    type="range"
                    v-model.number="formData.popularity"
                    min="0"
                    max="5"
                    step="0.1"
                    class="w-full"
                />
              </div>

              <div class="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    @click="closeFormModal"
                    class="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
                >
                  취소
                </button>
                <button
                    type="submit"
                    class="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- 삭제 확인 모달 -->
      <Teleport to="body">
        <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-950">
            <h2 class="text-lg font-semibold">목적지 삭제</h2>
            <p class="py-4 text-sm text-zinc-500 dark:text-zinc-400">
              정말로 {{ selectedDestination?.name }} 목적지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div class="flex justify-end space-x-2">
              <button
                  @click="closeDeleteModal"
                  class="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-950"
              >
                취소
              </button>
              <button
                  @click="confirmDelete"
                  class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MoreHorizontal, Pencil, Trash2, MapPin } from 'lucide-vue-next';
import { apiService } from "@/services/api";

const destinations = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = computed(() => Math.ceil(filteredDestinations.value.length / pageSize.value));

onMounted(async () => {
  try {
    const response = await apiService.get(`dashboard/destinations`);
    
    destinations.value = response;
    
    if (response) {
      if (response.content) {
        destinations.value = response.content;
        pageSize.value = response.totalPages;
      } else if (Array.isArray(response)) {
        destinations.value = response;
      } else {
        destinations.value = response;
      }
    } else {
      console.error("API 응답이 예상과 다릅니다:", response);
      destinations.value = [];
      pageSize.value = 0;
    }
  } catch (error) {
    console.error("Error fetching destinations:", error);
    destinations.value = [];
    pageSize.value = 0;
  }
});

// 테이블 컬럼 정의
const columns = [
  { key: 'name', label: '이름' },
  { key: 'country', label: '국가' },
  { key: 'city', label: '도시' },
  { key: 'category', label: '카테고리' },
  { key: 'reviewRating', label: '리뷰 점수' },
];


// 검색 상태
const searchQuery = ref('');
const filteredDestinations = computed(() => {
  if (!searchQuery.value) return destinations.value;
  return destinations.value.filter(destination =>
      destination.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 페이지네이션 함수
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 드롭다운 메뉴 상태
const activeDropdown = ref(null);
const toggleDropdown = (destinationId) => {
  activeDropdown.value = activeDropdown.value === destinationId ? null : destinationId;
};

// 모달 상태
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const modalTitle = ref('');
const selectedDestination = ref(null);
const formData = ref({
  name: '',
  country: '',
  city: '',
  category: '명소',
  popularity: 5,
});
const formErrors = ref({});

// 모달 열기/닫기 함수
const openAddModal = () => {
  modalTitle.value = '목적지 추가';
  formData.value = {
    name: '',
    country: '',
    city: '',
    category: '명소',
    popularity: 5,
  };
  formErrors.value = {};
  selectedDestination.value = null;
  isFormModalOpen.value = true;
  activeDropdown.value = null;
};

const openEditModal = (destination) => {
  modalTitle.value = '목적지 편집';
  formData.value = { ...destination };
  formErrors.value = {};
  selectedDestination.value = destination;
  isFormModalOpen.value = true;
  activeDropdown.value = null;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
};

const openDeleteModal = (destination) => {
  selectedDestination.value = destination;
  isDeleteModalOpen.value = true;
  activeDropdown.value = null;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
};

// 클릭 이벤트 감지하여 드롭다운 닫기
const handleClickOutside = () => {
  if (activeDropdown.value !== null) {
    activeDropdown.value = null;
  }
};

// 폼 제출 처리
const submitForm = () => {
  formErrors.value = {};

  // 간단한 유효성 검사
  if (!formData.value.name || formData.value.name.length < 2) {
    formErrors.value.name = '이름은 2자 이상이어야 합니다.';
  }

  if (!formData.value.country || formData.value.country.length < 2) {
    formErrors.value.country = '국가명은 2자 이상이어야 합니다.';
  }

  if (!formData.value.city || formData.value.city.length < 2) {
    formErrors.value.city = '도시명은 2자 이상이어야 합니다.';
  }

  if (Object.keys(formErrors.value).length > 0) {
    return;
  }

  if (selectedDestination.value) {
    // 목적지 수정
    const index = destinations.value.findIndex(d => d.id === selectedDestination.value.id);
    if (index !== -1) {
      destinations.value[index] = { ...selectedDestination.value, ...formData.value };
    }
  } else {
    // 목적지 추가
    const newId = (Math.max(...destinations.value.map(d => parseInt(d.id))) + 1).toString();
    destinations.value.push({
      id: newId,
      ...formData.value,
    });
  }

  closeFormModal();
};

// 삭제 확인
const confirmDelete = () => {
  if (selectedDestination.value) {
    destinations.value = destinations.value.filter(d => d.id !== selectedDestination.value.id);
  }
  closeDeleteModal();
};

// 컴포넌트 마운트 시 이벤트 리스너 등록
window.addEventListener('click', handleClickOutside);

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
