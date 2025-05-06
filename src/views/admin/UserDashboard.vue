<template>
  <div class="container mx-auto px-6">
    <div class="flex min-h-screen flex-col space-y-6">
      <div class="container grid flex-1 gap-12">
        <main class="flex w-full flex-1 flex-col overflow-hidden">
          <div class="flex flex-col gap-4 md:gap-6">
            <div class="grid gap-1">
              <h1 class="text-2xl font-bold tracking-tight">사용자 관리</h1>
              <p class="text-zinc-500 dark:text-zinc-400">시스템의 모든 사용자를 관리합니다.</p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between">
                <h2 class="text-xl font-bold">사용자 목록</h2>
                <button
                    @click="openAddModal"
                    class="inline-flex items-center rounded-md bg-amber-400 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                >
                  <UserPlus class="mr-2 h-4 w-4" />
                  사용자 추가
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
                    <th v-for="column in columns" :key="column.key" class="px-4 py-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      {{ column.label }}
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      작업
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                      v-for="user in filteredUsers"
                      :key="user.id"
                      class="border-b dark:border-zinc-800"
                  >
                    <td class="px-4 py-3 text-sm">{{ user.name }}</td>
                    <td class="px-4 py-3 text-sm">{{ user.email }}</td>
                    <td class="px-4 py-3 text-sm">{{ user.role }}</td>
                    <td class="px-4 py-3 text-sm">
                      <div :class="`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === '활성'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`">
                        {{ user.status }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">{{ user.createdAt }}</td>
                    <td class="px-4 py-3 text-center text-sm">
                      <div class="relative">
                        <button @click="toggleDropdown(user.id)" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                          <MoreHorizontal class="h-4 w-4" />
                        </button>
                        <div v-if="activeDropdown === user.id" class="absolute right-0 z-10 mt-2 w-36 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                          <div class="py-1 text-sm text-zinc-700 dark:text-zinc-300">
                            <div class="border-b border-zinc-200 px-3 py-2 font-medium dark:border-zinc-800">작업</div>
                            <button @click="openEditModal(user)" class="flex w-full items-center px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <Pencil class="mr-2 h-4 w-4" />
                              <span>편집</span>
                            </button>
                            <button @click="openDeleteModal(user)" class="flex w-full items-center px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                              <Trash2 class="mr-2 h-4 w-4" />
                              <span>삭제</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredUsers.length === 0">
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

      <!-- 사용자 추가/편집 모달 -->
      <Teleport to="body">
        <div v-if="isFormModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-950">
            <div class="mb-4">
              <h2 class="text-lg font-semibold">{{ modalTitle }}</h2>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                사용자 정보를 입력하세요. 완료되면 저장 버튼을 클릭하세요.
              </p>
            </div>

            <form @submit.prevent="submitForm" class="space-y-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">이름</label>
                <input
                    v-model="formData.name"
                    placeholder="사용자 이름"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
                <p v-if="formErrors.name" class="text-xs text-red-500">{{ formErrors.name }}</p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">이메일</label>
                <input
                    v-model="formData.email"
                    placeholder="이메일 주소"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                />
                <p v-if="formErrors.email" class="text-xs text-red-500">{{ formErrors.email }}</p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">역할</label>
                <select
                    v-model="formData.role"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="일반 사용자">일반 사용자</option>
                  <option value="프리미엄">프리미엄</option>
                  <option value="관리자">관리자</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">상태</label>
                <select
                    v-model="formData.status"
                    class="w-full rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="활성">활성</option>
                  <option value="비활성">비활성</option>
                </select>
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
                    class="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
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
            <h2 class="text-lg font-semibold">사용자 삭제</h2>
            <p class="py-4 text-sm text-zinc-500 dark:text-zinc-400">
              정말로 {{ selectedUser?.name }} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
import {ref, computed, onUnmounted} from 'vue';
import { MoreHorizontal, Pencil, Trash2, UserPlus } from 'lucide-vue-next';

// 사용자 데이터
const users = ref([
  {
    id: "1",
    name: "김민수",
    email: "minsu.kim@example.com",
    role: "일반 사용자",
    status: "활성",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "이지은",
    email: "jieun.lee@example.com",
    role: "프리미엄",
    status: "활성",
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    name: "박준호",
    email: "junho.park@example.com",
    role: "일반 사용자",
    status: "비활성",
    createdAt: "2023-03-10",
  },
  {
    id: "4",
    name: "최유진",
    email: "yujin.choi@example.com",
    role: "프리미엄",
    status: "활성",
    createdAt: "2023-04-05",
  },
  {
    id: "5",
    name: "정다운",
    email: "dawn.jung@example.com",
    role: "일반 사용자",
    status: "활성",
    createdAt: "2023-05-12",
  },
]);

// 테이블 컬럼 정의
const columns = [
  { key: 'name', label: '이름' },
  { key: 'email', label: '이메일' },
  { key: 'role', label: '역할' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '가입일' },
];

// 페이지네이션 상태
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / pageSize.value));

// 검색 상태
const searchQuery = ref('');
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
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
const toggleDropdown = (userId) => {
  activeDropdown.value = activeDropdown.value === userId ? null : userId;
};

// 모달 상태
const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const modalTitle = ref('');
const selectedUser = ref(null);
const formData = ref({
  name: '',
  email: '',
  role: '일반 사용자',
  status: '활성',
});
const formErrors = ref({});

// 모달 열기/닫기 함수
const openAddModal = () => {
  modalTitle.value = '사용자 추가';
  formData.value = {
    name: '',
    email: '',
    role: '일반 사용자',
    status: '활성',
  };
  formErrors.value = {};
  selectedUser.value = null;
  isFormModalOpen.value = true;
  activeDropdown.value = null;
};

const openEditModal = (user) => {
  modalTitle.value = '사용자 편집';
  formData.value = { ...user };
  formErrors.value = {};
  selectedUser.value = user;
  isFormModalOpen.value = true;
  activeDropdown.value = null;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
};

const openDeleteModal = (user) => {
  selectedUser.value = user;
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

  if (!formData.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = '유효한 이메일 주소를 입력해주세요.';
  }

  if (Object.keys(formErrors.value).length > 0) {
    return;
  }

  if (selectedUser.value) {
    // 사용자 수정
    const index = users.value.findIndex(u => u.id === selectedUser.value.id);
    if (index !== -1) {
      users.value[index] = { ...selectedUser.value, ...formData.value };
    }
  } else {
    // 사용자 추가
    const newId = (Math.max(...users.value.map(u => parseInt(u.id))) + 1).toString();
    users.value.push({
      id: newId,
      ...formData.value,
      createdAt: new Date().toISOString().split('T')[0],
    });
  }

  closeFormModal();
};

// 삭제 확인
const confirmDelete = () => {
  if (selectedUser.value) {
    users.value = users.value.filter(u => u.id !== selectedUser.value.id);
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