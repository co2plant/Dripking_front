<template>
  <main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">카테고리 관리</h1>
      <p class="text-sm text-zinc-500">술과 목적지 분류에 사용하는 카테고리를 관리합니다.</p>
    </header>

    <section class="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div class="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 class="text-base font-semibold text-zinc-950">카테고리 목록</h2>
          <button
              type="button"
              @click="fetchCategories"
              class="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <RefreshCw class="mr-2 h-4 w-4" />
            새로고침
          </button>
        </div>

        <div v-if="isLoading" class="px-4 py-12 text-center text-sm text-zinc-500">
          카테고리를 불러오는 중입니다.
        </div>
        <div v-else-if="categories.length === 0" class="px-4 py-12 text-center text-sm text-zinc-500">
          등록된 카테고리가 없습니다.
        </div>
        <table v-else class="w-full table-fixed">
          <thead class="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th class="w-52 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">이름</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">설명</th>
            <th class="w-28 px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">작업</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="category in categories" :key="category.id" class="border-b border-zinc-100 last:border-0">
            <td class="px-4 py-4 text-sm font-medium text-zinc-950">{{ category.name }}</td>
            <td class="px-4 py-4 text-sm text-zinc-600">{{ category.description || '-' }}</td>
            <td class="px-4 py-4">
              <div class="flex justify-end gap-2">
                <button
                    type="button"
                    @click="startEdit(category)"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    title="수정"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                    type="button"
                    @click="deleteCategory(category)"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    title="삭제"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <form @submit.prevent="submitCategory" class="h-fit rounded-md border border-zinc-200 bg-white p-5">
        <h2 class="text-base font-semibold text-zinc-950">{{ editingCategory ? '카테고리 수정' : '카테고리 추가' }}</h2>
        <div class="mt-5 space-y-4">
          <label class="block">
            <span class="text-sm font-medium text-zinc-700">이름</span>
            <input
                v-model.trim="form.name"
                class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
                required
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-zinc-700">설명</span>
            <textarea
                v-model.trim="form.description"
                rows="4"
                class="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"
            ></textarea>
          </label>
        </div>

        <p v-if="message" class="mt-4 text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'">
          {{ message }}
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <button
              v-if="editingCategory"
              type="button"
              @click="resetForm"
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
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Pencil, RefreshCw, Trash2 } from 'lucide-vue-next';
import { apiService } from '@/services/api';

const categories = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const editingCategory = ref(null);
const form = ref({
  name: '',
  description: '',
});
const message = ref('');
const messageType = ref('success');

const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const response = await apiService.get('categories');
    categories.value = Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Category fetch failed:', error);
    showMessage('카테고리를 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const submitCategory = async () => {
  isSaving.value = true;
  message.value = '';
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
    };

    if (editingCategory.value) {
      await apiService.putWithToken(`categories/${editingCategory.value.id}`, payload);
      showMessage('카테고리를 수정했습니다.');
    } else {
      await apiService.postWithToken('categories', payload);
      showMessage('카테고리를 추가했습니다.');
    }

    resetForm();
    await fetchCategories();
  } catch (error) {
    console.error('Category save failed:', error);
    showMessage('카테고리를 저장하지 못했습니다.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const startEdit = (category) => {
  editingCategory.value = category;
  form.value = {
    name: category.name || '',
    description: category.description || '',
  };
  message.value = '';
};

const deleteCategory = async (category) => {
  if (!window.confirm(`${category.name} 카테고리를 삭제하시겠습니까?`)) {
    return;
  }

  try {
    await apiService.deleteWithToken(`categories/${category.id}`);
    showMessage('카테고리를 삭제했습니다.');
    if (editingCategory.value?.id === category.id) {
      resetForm();
    }
    await fetchCategories();
  } catch (error) {
    console.error('Category delete failed:', error);
    showMessage('카테고리를 삭제하지 못했습니다.', 'error');
  }
};

const resetForm = () => {
  editingCategory.value = null;
  form.value = {
    name: '',
    description: '',
  };
};

const showMessage = (nextMessage, type = 'success') => {
  message.value = nextMessage;
  messageType.value = type;
};

onMounted(() => {
  fetchCategories();
});
</script>
