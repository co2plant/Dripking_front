<template>
  <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">사용자 관리</h1>
      <p class="text-sm text-zinc-500">사용자 계정, 권한, 잠금 상태를 관리합니다.</p>
    </header>

    <section class="flex flex-col gap-3 border-b border-zinc-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row">
        <input
            v-model="searchQuery"
            @keyup.enter="fetchUsers(0)"
            placeholder="닉네임 또는 이메일 검색"
            class="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm sm:w-72"
        />
        <select
            v-model="lockedFilter"
            @change="fetchUsers(0)"
            class="h-10 rounded-md border border-zinc-200 px-3 text-sm"
        >
          <option value="">전체 상태</option>
          <option value="false">활성</option>
          <option value="true">잠김</option>
        </select>
      </div>
      <button
          type="button"
          @click="fetchUsers(0)"
          class="inline-flex h-10 w-fit items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
      >
        <RefreshCw class="mr-2 h-4 w-4" />
        조회
      </button>
    </section>

    <p v-if="message" class="text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'">
      {{ message }}
    </p>

    <section class="overflow-hidden rounded-md border border-zinc-200 bg-white">
      <div v-if="isLoading" class="px-4 py-12 text-center text-sm text-zinc-500">
        사용자 목록을 불러오는 중입니다.
      </div>
      <div v-else-if="users.length === 0" class="px-4 py-12 text-center text-sm text-zinc-500">
        표시할 사용자가 없습니다.
      </div>
      <table v-else class="w-full table-fixed">
        <thead class="border-b border-zinc-200 bg-zinc-50">
        <tr>
          <th class="w-44 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">닉네임</th>
          <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">이메일</th>
          <th class="w-36 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">권한</th>
          <th class="w-28 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">상태</th>
          <th class="w-36 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">가입일</th>
          <th class="w-32 px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">작업</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id" class="border-b border-zinc-100 last:border-0">
          <td class="px-4 py-4 text-sm font-medium text-zinc-950">{{ user.nickname || '-' }}</td>
          <td class="px-4 py-4 text-sm text-zinc-700">{{ user.email }}</td>
          <td class="px-4 py-4 text-sm text-zinc-700">{{ displayRole(user.roles) }}</td>
          <td class="px-4 py-4">
            <span
                class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                :class="user.locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
            >
              {{ user.locked ? '잠김' : '활성' }}
            </span>
          </td>
          <td class="px-4 py-4 text-sm text-zinc-600">{{ formatDate(user.createdAt) }}</td>
          <td class="px-4 py-4">
            <div class="flex justify-end gap-2">
              <button
                  type="button"
                  @click="openEditModal(user)"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  title="수정"
              >
                <Pencil class="h-4 w-4" />
              </button>
              <button
                  type="button"
                  @click="confirmDelete(user)"
                  :disabled="isCurrentUser(user)"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  title="삭제"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </section>

    <nav class="flex items-center justify-end gap-2">
      <button
          type="button"
          @click="fetchUsers(currentPage - 1)"
          :disabled="currentPage <= 0 || isLoading"
          class="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
      >
        이전
      </button>
      <span class="text-sm text-zinc-500">{{ currentPage + 1 }} / {{ Math.max(totalPages, 1) }}</span>
      <button
          type="button"
          @click="fetchUsers(currentPage + 1)"
          :disabled="currentPage + 1 >= totalPages || isLoading"
          class="rounded-md border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
      >
        다음
      </button>
    </nav>

    <Teleport to="body">
      <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <form
            @submit.prevent="submitEdit"
            class="w-full max-w-md rounded-lg bg-white p-6 text-left shadow-lg"
        >
          <h2 class="text-lg font-semibold text-zinc-950">사용자 수정</h2>
          <p class="mt-1 text-sm text-zinc-500">{{ selectedUser?.email }}</p>

          <div class="mt-6 space-y-4">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">권한</span>
              <select
                  v-model="editForm.role"
                  :disabled="selectedUser && isCurrentUser(selectedUser)"
                  class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
              >
                <option value="USER">일반 사용자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </label>

            <label class="block">
              <span class="text-sm font-medium text-zinc-700">상태</span>
              <select
                  v-model="editForm.locked"
                  :disabled="selectedUser && isCurrentUser(selectedUser)"
                  class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
              >
                <option :value="false">활성</option>
                <option :value="true">잠김</option>
              </select>
            </label>

            <p v-if="selectedUser && isCurrentUser(selectedUser)" class="text-xs text-amber-700">
              자기 자신의 관리자 권한과 활성 상태는 이 화면에서 변경할 수 없습니다.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button
                type="button"
                @click="closeEditModal"
                class="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              취소
            </button>
            <button
                type="submit"
                :disabled="isSaving"
                class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Pencil, RefreshCw, Trash2 } from 'lucide-vue-next';
import { apiService } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const users = ref([]);
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;
const searchQuery = ref('');
const lockedFilter = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const isEditModalOpen = ref(false);
const selectedUser = ref(null);
const editForm = ref({ role: 'USER', locked: false });
const message = ref('');
const messageType = ref('success');

const buildEndpoint = (page) => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(pageSize),
  });
  if (searchQuery.value.trim()) {
    params.set('search', searchQuery.value.trim());
  }
  if (lockedFilter.value !== '') {
    params.set('locked', lockedFilter.value);
  }
  return `admin/users?${params.toString()}`;
};

const fetchUsers = async (page = 0) => {
  isLoading.value = true;
  message.value = '';
  try {
    const response = await apiService.getWithToken(buildEndpoint(page));
    users.value = response?.content || [];
    currentPage.value = response?.number ?? page;
    totalPages.value = response?.totalPages ?? 0;
  } catch (error) {
    console.error('Admin users fetch failed:', error);
    users.value = [];
    showMessage('사용자 목록을 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (user) => {
  selectedUser.value = user;
  editForm.value = {
    role: user.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER',
    locked: Boolean(user.locked),
  };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
  selectedUser.value = null;
};

const submitEdit = async () => {
  if (!selectedUser.value) return;

  isSaving.value = true;
  message.value = '';
  try {
    const currentRole = selectedUser.value.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER';
    if (editForm.value.role !== currentRole) {
      await apiService.patchWithToken(`admin/users/${selectedUser.value.id}/role`, { role: editForm.value.role });
    }
    if (editForm.value.locked !== Boolean(selectedUser.value.locked)) {
      await apiService.patchWithToken(`admin/users/${selectedUser.value.id}/status`, { locked: editForm.value.locked });
    }
    showMessage('사용자 정보를 저장했습니다.');
    closeEditModal();
    await fetchUsers(currentPage.value);
  } catch (error) {
    console.error('Admin user update failed:', error);
    showMessage(error?.body?.message || '사용자 정보를 저장하지 못했습니다.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (user) => {
  if (isCurrentUser(user)) {
    showMessage('자기 자신의 관리자 계정은 삭제할 수 없습니다.', 'error');
    return;
  }
  if (!window.confirm(`${user.nickname || user.email} 사용자를 삭제하시겠습니까?`)) {
    return;
  }

  try {
    await apiService.deleteWithToken(`admin/users/${user.id}`);
    showMessage('사용자를 삭제했습니다.');
    await fetchUsers(currentPage.value);
  } catch (error) {
    console.error('Admin user delete failed:', error);
    showMessage(error?.body?.message || '사용자를 삭제하지 못했습니다.', 'error');
  }
};

const isCurrentUser = (user) => String(user.id) === String(authStore.userId);

const displayRole = (roles = []) => roles.includes('ROLE_ADMIN') ? '관리자' : '일반 사용자';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const showMessage = (nextMessage, type = 'success') => {
  message.value = nextMessage;
  messageType.value = type;
};

onMounted(() => {
  fetchUsers();
});
</script>
