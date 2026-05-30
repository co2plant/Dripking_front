<template>
  <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">목적지 관리</h1>
      <p class="text-sm text-zinc-500">여행 목적지 목록과 등록 정보를 관리합니다.</p>
    </header>

    <p v-if="message" class="text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'">
      {{ message }}
    </p>

    <section class="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div class="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div class="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <h2 class="text-base font-semibold text-zinc-950">목적지 목록</h2>
          <div class="flex gap-2">
            <input
                v-model.trim="searchQuery"
                @keyup.enter="fetchDestinations"
                class="h-9 min-w-0 rounded-md border border-zinc-200 px-3 text-sm"
                placeholder="이름 검색"
            />
            <button
                type="button"
                @click="fetchDestinations"
                class="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              검색
            </button>
            <button
                type="button"
                @click="refreshAll"
                class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                title="새로고침"
            >
              <RefreshCw class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="px-4 py-12 text-center text-sm text-zinc-500">
          목록을 불러오는 중입니다.
        </div>
        <div v-else-if="destinations.length === 0" class="px-4 py-12 text-center text-sm text-zinc-500">
          표시할 목적지가 없습니다.
        </div>
        <table v-else class="w-full table-fixed">
          <thead class="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th class="w-44 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">이름</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">위치</th>
            <th class="w-36 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">좌표</th>
            <th class="w-28 px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">작업</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="destination in destinations" :key="destination.id" class="border-b border-zinc-100 last:border-0">
            <td class="px-4 py-4 align-top text-sm font-medium text-zinc-950">
              {{ destination.name }}
              <span v-if="!destination.imgUrl" class="mt-1 block text-xs font-semibold text-amber-700">이미지 필요</span>
            </td>
            <td class="px-4 py-4 align-top text-sm text-zinc-600">
              <div>{{ destination.countryName || '-' }} {{ destination.cityName || '' }}</div>
              <div class="mt-1 line-clamp-2 text-xs text-zinc-400">{{ destination.description || '-' }}</div>
            </td>
            <td class="px-4 py-4 align-top text-xs text-zinc-500">
              <span v-if="hasMissingCoordinates(destination)" class="rounded bg-amber-100 px-2 py-1 font-semibold text-amber-800">
                보완 필요
              </span>
              <span v-else>{{ destination.latitude }}, {{ destination.longitude }}</span>
            </td>
            <td class="px-4 py-4 align-top">
              <div class="flex justify-end gap-2">
                <button
                    type="button"
                    @click="startEdit(destination)"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    title="수정"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                    type="button"
                    @click="deleteDestination(destination)"
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

      <form @submit.prevent="submitForm" class="h-fit rounded-md border border-zinc-200 bg-white p-5">
        <h2 class="text-base font-semibold text-zinc-950">
          {{ editingDestination ? '목적지 수정' : '목적지 추가' }}
        </h2>

        <div class="mt-5 space-y-4">
          <label class="block">
            <span class="text-sm font-medium text-zinc-700">이름</span>
            <input v-model.trim="form.name" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">설명</span>
            <textarea v-model.trim="form.description" rows="3" class="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm"></textarea>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">이미지 URL</span>
            <input v-model.trim="form.imgUrl" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">이미지 파일</span>
            <div class="mt-1 flex items-center gap-2">
              <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  :disabled="isUploadingImage || isSaving"
                  @change="handleImageUpload"
                  class="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 disabled:opacity-50"
              />
              <span v-if="isUploadingImage" class="whitespace-nowrap text-xs font-medium text-zinc-500">업로드 중</span>
            </div>
            <span v-if="form.imgObjectKey" class="mt-1 block truncate text-xs text-zinc-400">{{ form.imgObjectKey }}</span>
          </label>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">국가</span>
            <select v-model.number="form.countryId" @change="loadCitiesForCountry" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
              <option :value="null" disabled>국가를 선택하세요</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
            </select>
          </label>
          <div class="flex gap-2">
            <input
                v-model.trim="newCountryName"
                :disabled="isCreatingCountry"
                class="h-10 min-w-0 flex-1 rounded-md border border-zinc-200 px-3 text-sm"
                placeholder="새 국가"
            />
            <button
                type="button"
                :disabled="isCreatingCountry || !newCountryName"
                @click="createCountry"
                class="h-10 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              국가 추가
            </button>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">도시</span>
            <select v-model.number="form.cityId" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
              <option :value="null" disabled>도시를 선택하세요</option>
              <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
            </select>
          </label>
          <div class="flex gap-2">
            <input
                v-model.trim="newCityName"
                :disabled="isCreatingCity || !form.countryId"
                class="h-10 min-w-0 flex-1 rounded-md border border-zinc-200 px-3 text-sm"
                placeholder="새 도시"
            />
            <button
                type="button"
                :disabled="isCreatingCity || !form.countryId || !newCityName"
                @click="createCity"
                class="h-10 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
            >
              도시 추가
            </button>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-zinc-700">카테고리</span>
            <select v-model.number="form.categoryId" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
              <option :value="null">선택 안 함</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">위도</span>
              <input v-model.number="form.latitude" type="number" step="0.000001" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">경도</span>
              <input v-model.number="form.longitude" type="number" step="0.000001" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </label>
          </div>
        </div>

        <p v-if="formWarning" class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {{ formWarning }}
        </p>
        <p class="mt-4 text-xs text-zinc-500">새 목적지는 설명, 이미지, 국가, 도시, 위도, 경도가 필요합니다.</p>

        <div class="mt-5 flex justify-end gap-2">
          <button v-if="editingDestination" type="button" @click="resetForm" class="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            취소
          </button>
          <button type="submit" :disabled="isSaving || isUploadingImage" class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40">
            저장
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { Pencil, RefreshCw, Trash2 } from 'lucide-vue-next';
import { apiService } from '@/services/api';

const destinations = ref([]);
const categories = ref([]);
const countries = ref([]);
const cities = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const isUploadingImage = ref(false);
const isCreatingCountry = ref(false);
const isCreatingCity = ref(false);
const editingDestination = ref(null);
const message = ref('');
const messageType = ref('success');
const newCountryName = ref('');
const newCityName = ref('');
const form = ref({});

const emptyForm = () => ({
  name: '',
  description: '',
  imgUrl: '',
  imgObjectKey: '',
  countryId: null,
  cityId: null,
  categoryId: null,
  latitude: null,
  longitude: null,
});

const formWarning = computed(() => {
  if (hasMissingCoordinates(form.value)) {
    return editingDestination.value
        ? '좌표가 없어 public 지도와 marker API에 표시되지 않습니다. 기존 데이터 편집은 가능하지만 위도와 경도를 보완해야 합니다.'
        : '새 목적지에는 위도와 경도가 필요합니다.';
  }
  return '';
});

const fetchOptions = async () => {
  const [categoryResponse, countryResponse] = await Promise.all([
    apiService.get('categories'),
    apiService.get('countries'),
  ]);
  categories.value = Array.isArray(categoryResponse) ? categoryResponse : [];
  countries.value = Array.isArray(countryResponse) ? countryResponse : [];
};

const fetchDestinations = async () => {
  isLoading.value = true;
  message.value = '';
  try {
    const keyword = searchQuery.value.trim();
    const endpoint = keyword
        ? `destinations/search/${encodeURIComponent(keyword)}?size=200`
        : 'destinations?size=200';
    const response = await apiService.get(endpoint);
    destinations.value = response?.content || [];
  } catch (error) {
    console.error('Destination fetch failed:', error);
    showMessage('목적지 목록을 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const refreshAll = async () => {
  await fetchOptions();
  await fetchDestinations();
};

const loadCitiesForCountry = async () => {
  form.value.cityId = null;
  cities.value = [];
  newCityName.value = '';
  if (!form.value.countryId) return;
  try {
    const response = await apiService.get(`cities/country/${form.value.countryId}?size=200`);
    cities.value = response?.content || [];
  } catch (error) {
    console.error('City fetch failed:', error);
    showMessage('도시 목록을 불러오지 못했습니다.', 'error');
  }
};

const createCountry = async () => {
  if (!newCountryName.value) return;
  isCreatingCountry.value = true;
  message.value = '';
  try {
    const country = await apiService.postWithToken('countries', {
      name: newCountryName.value,
      description: '',
    });
    countries.value = [...countries.value, country];
    form.value.countryId = country.id;
    newCountryName.value = '';
    await loadCitiesForCountry();
    showMessage('국가를 추가했습니다.');
  } catch (error) {
    console.error('Country create failed:', error);
    showMessage(apiErrorMessage(error, '국가를 추가하지 못했습니다.'), 'error');
  } finally {
    isCreatingCountry.value = false;
  }
};

const createCity = async () => {
  if (!newCityName.value || !form.value.countryId) return;
  isCreatingCity.value = true;
  message.value = '';
  try {
    const city = await apiService.postWithToken('cities', {
      name: newCityName.value,
      description: '',
      countryId: form.value.countryId,
    });
    cities.value = [...cities.value, city];
    form.value.cityId = city.id;
    newCityName.value = '';
    showMessage('도시를 추가했습니다.');
  } catch (error) {
    console.error('City create failed:', error);
    showMessage(apiErrorMessage(error, '도시를 추가하지 못했습니다.'), 'error');
  } finally {
    isCreatingCity.value = false;
  }
};

const submitForm = async () => {
  if (isUploadingImage.value) {
    showMessage('이미지 업로드가 끝난 뒤 저장해주세요.', 'error');
    return;
  }
  const validationError = validateForm();
  if (validationError) {
    showMessage(validationError, 'error');
    return;
  }

  isSaving.value = true;
  message.value = '';
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      imgUrl: form.value.imgUrl,
      imgObjectKey: form.value.imgObjectKey,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      cityId: form.value.cityId,
      categoryId: form.value.categoryId,
    };
    if (editingDestination.value) {
      await apiService.putWithToken(`destinations/${editingDestination.value.id}`, payload);
      showMessage('목적지 정보를 수정했습니다.');
    } else {
      await apiService.postWithToken('destinations', payload);
      showMessage('목적지를 추가했습니다.');
    }
    resetForm();
    await fetchDestinations();
  } catch (error) {
    console.error('Destination save failed:', error);
    showMessage(apiErrorMessage(error, '목적지를 저장하지 못했습니다.'), 'error');
  } finally {
    isSaving.value = false;
  }
};

const validateForm = () => {
  if (!form.value.name) return '이름이 필요합니다.';
  if (!editingDestination.value && !form.value.description) return '새 목적지에는 설명이 필요합니다.';
  if (!editingDestination.value && !form.value.imgUrl) return '새 목적지에는 이미지가 필요합니다.';
  if (!form.value.countryId) return '국가를 선택해주세요.';
  if (!form.value.cityId) return '도시를 선택해주세요.';
  if (!editingDestination.value && hasMissingCoordinates(form.value)) return '새 목적지에는 위도와 경도가 필요합니다.';
  return '';
};

const startEdit = async (destination) => {
  editingDestination.value = destination;
  form.value = {
    ...emptyForm(),
    ...destination,
    countryId: destination.countryId || null,
    cityId: destination.cityId || null,
  };
  if (form.value.countryId) {
    await loadCitiesForCountry();
    form.value.cityId = destination.cityId || null;
  }
  message.value = '';
};

const deleteDestination = async (destination) => {
  if (!window.confirm(`${destination.name} 목적지를 삭제하시겠습니까?`)) return;
  try {
    await apiService.deleteWithToken(`destinations/${destination.id}`);
    if (editingDestination.value?.id === destination.id) {
      resetForm();
    }
    showMessage('목적지를 삭제했습니다.');
    await fetchDestinations();
  } catch (error) {
    console.error('Destination delete failed:', error);
    showMessage(apiErrorMessage(error, '목적지를 삭제하지 못했습니다.'), 'error');
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;

  const validationError = validateImageFile(file);
  if (validationError) {
    showMessage(validationError, 'error');
    return;
  }

  isUploadingImage.value = true;
  message.value = '';
  try {
    const body = new FormData();
    body.append('file', file);
    body.append('itemType', 'DESTINATION');
    const response = await apiService.postFormWithToken('admin/content-images', body);
    form.value.imgUrl = response.imgUrl;
    form.value.imgObjectKey = response.imgObjectKey;
    showMessage('이미지를 업로드했습니다.');
  } catch (error) {
    console.error('Image upload failed:', error);
    showMessage(apiErrorMessage(error, '이미지 업로드에 실패했습니다.'), 'error');
  } finally {
    isUploadingImage.value = false;
  }
};

const validateImageFile = (file) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension) || !allowedTypes.includes(file.type)) {
    return 'jpg, jpeg, png, webp 이미지만 업로드할 수 있습니다.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return '이미지 파일은 5MB 이하여야 합니다.';
  }
  return '';
};

const resetForm = () => {
  editingDestination.value = null;
  form.value = emptyForm();
  cities.value = [];
  newCountryName.value = '';
  newCityName.value = '';
};

const hasMissingCoordinates = (destination) => (
  destination.latitude == null
  || destination.longitude == null
  || destination.latitude === ''
  || destination.longitude === ''
);

const showMessage = (nextMessage, type = 'success') => {
  message.value = nextMessage;
  messageType.value = type;
};

const apiErrorMessage = (error, fallback) => (
  error?.body?.message
  || error?.body?.detail
  || error?.message
  || fallback
);

onMounted(async () => {
  resetForm();
  await refreshAll();
});
</script>
