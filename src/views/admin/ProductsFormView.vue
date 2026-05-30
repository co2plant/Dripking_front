<template>
  <main class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 text-left">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold tracking-tight text-zinc-950">콘텐츠 관리</h1>
      <p class="text-sm text-zinc-500">술, 양조장, 여행지를 도메인별 필드로 관리합니다.</p>
    </header>

    <nav class="inline-flex w-fit rounded-md border border-zinc-200 bg-white p-1">
      <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="setActiveTab(tab.key)"
          :class="[
            'rounded px-4 py-2 text-sm font-medium',
            activeTab === tab.key ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          ]"
      >
        {{ tab.label }}
      </button>
    </nav>

    <p v-if="message" class="text-sm" :class="messageType === 'error' ? 'text-red-600' : 'text-green-700'">
      {{ message }}
    </p>

    <section class="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div class="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 class="text-base font-semibold text-zinc-950">{{ currentConfig.label }} 목록</h2>
          <button
              type="button"
              @click="fetchActiveItems"
              class="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <RefreshCw class="mr-2 h-4 w-4" />
            새로고침
          </button>
        </div>

        <div v-if="isLoading" class="px-4 py-12 text-center text-sm text-zinc-500">
          목록을 불러오는 중입니다.
        </div>
        <div v-else-if="activeItems.length === 0" class="px-4 py-12 text-center text-sm text-zinc-500">
          표시할 콘텐츠가 없습니다.
        </div>
        <table v-else class="w-full table-fixed">
          <thead class="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th class="w-48 px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">이름</th>
            <th class="px-4 py-3 text-left text-xs font-semibold uppercase text-zinc-500">요약</th>
            <th class="w-32 px-4 py-3 text-right text-xs font-semibold uppercase text-zinc-500">작업</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in activeItems" :key="item.id" class="border-b border-zinc-100 last:border-0">
            <td class="px-4 py-4 align-top text-sm font-medium text-zinc-950">{{ item.name }}</td>
            <td class="px-4 py-4 align-top text-sm text-zinc-600">
              <div class="line-clamp-2">{{ item.description || item.address || '-' }}</div>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span>{{ itemMeta(item) }}</span>
                <span
                    v-if="hasMissingCoordinates(item)"
                    class="rounded bg-amber-100 px-2 py-1 font-semibold text-amber-800"
                >
                  좌표 보완 필요
                </span>
              </div>
            </td>
            <td class="px-4 py-4 align-top">
              <div class="flex justify-end gap-2">
                <button
                    type="button"
                    @click="startEdit(item)"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    title="수정"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                    type="button"
                    @click="deleteItem(item)"
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
          {{ editingItem ? `${currentConfig.label} 수정` : `${currentConfig.label} 추가` }}
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

          <template v-if="activeTab === 'alcohol'">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">카테고리</span>
              <select v-model.number="form.categoryId" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
                <option :value="null" disabled>카테고리를 선택하세요</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </label>
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">양조장</span>
              <select v-model.number="form.distilleryId" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
                <option :value="null" disabled>양조장을 선택하세요</option>
                <option v-for="distillery in distilleries" :key="distillery.id" :value="distillery.id">{{ distillery.name }}</option>
              </select>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="text-sm font-medium text-zinc-700">도수</span>
                <input v-model.number="form.strength" type="number" min="0" max="100" step="0.1" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-zinc-700">용량</span>
                <input v-model.number="form.size" type="number" min="0" step="1" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
              </label>
            </div>
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">숙성 연도</span>
              <input v-model.trim="form.statedAge" class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </label>
          </template>

          <template v-if="activeTab === 'distillery'">
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">주소</span>
              <input v-model.trim="form.address" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-zinc-700">연결 여행지</span>
              <select v-model.number="form.destinationId" required class="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm">
                <option :value="null" disabled>여행지를 선택하세요</option>
                <option v-for="destination in destinations" :key="destination.id" :value="destination.id">{{ destination.name }}</option>
              </select>
            </label>
            <CoordinateFields v-model:latitude="form.latitude" v-model:longitude="form.longitude" />
          </template>

          <template v-if="activeTab === 'destination'">
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
            <CoordinateFields v-model:latitude="form.latitude" v-model:longitude="form.longitude" />
          </template>
        </div>

        <p v-if="formCoordinateWarning" class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {{ formCoordinateWarning }}
        </p>
        <p class="mt-4 text-xs text-zinc-500">jpg, jpeg, png, webp 파일만 업로드할 수 있으며 최대 크기는 5MB입니다.</p>

        <div class="mt-5 flex justify-end gap-2">
          <button v-if="editingItem" type="button" @click="resetForm" class="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
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
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { Pencil, RefreshCw, Trash2 } from 'lucide-vue-next';
import { apiService } from '@/services/api';

const CoordinateFields = defineComponent({
  props: {
    latitude: { type: [Number, String], default: null },
    longitude: { type: [Number, String], default: null },
  },
  emits: ['update:latitude', 'update:longitude'],
  setup(props, { emit }) {
    return () => h('div', { class: 'grid grid-cols-2 gap-3' }, [
      h('label', { class: 'block' }, [
        h('span', { class: 'text-sm font-medium text-zinc-700' }, '위도'),
        h('input', {
          value: props.latitude,
          type: 'number',
          step: '0.000001',
          class: 'mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm',
          onInput: event => emit('update:latitude', event.target.value === '' ? null : Number(event.target.value)),
        }),
      ]),
      h('label', { class: 'block' }, [
        h('span', { class: 'text-sm font-medium text-zinc-700' }, '경도'),
        h('input', {
          value: props.longitude,
          type: 'number',
          step: '0.000001',
          class: 'mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm',
          onInput: event => emit('update:longitude', event.target.value === '' ? null : Number(event.target.value)),
        }),
      ]),
    ]);
  },
});

const tabs = [
  { key: 'alcohol', label: '술', endpoint: 'alcohols' },
  { key: 'distillery', label: '양조장', endpoint: 'distilleries' },
  { key: 'destination', label: '여행지', endpoint: 'destinations' },
];

const activeTab = ref('alcohol');
const alcohols = ref([]);
const distilleries = ref([]);
const destinations = ref([]);
const categories = ref([]);
const countries = ref([]);
const cities = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const isUploadingImage = ref(false);
const isCreatingCountry = ref(false);
const isCreatingCity = ref(false);
const editingItem = ref(null);
const message = ref('');
const messageType = ref('success');
const form = ref({});
const newCountryName = ref('');
const newCityName = ref('');

const currentConfig = computed(() => tabs.find(tab => tab.key === activeTab.value));
const activeItems = computed(() => {
  if (activeTab.value === 'alcohol') return alcohols.value;
  if (activeTab.value === 'distillery') return distilleries.value;
  return destinations.value;
});
const requiresCoordinates = computed(() => activeTab.value === 'distillery' || activeTab.value === 'destination');
const formHasMissingCoordinates = computed(() => requiresCoordinates.value && hasMissingCoordinates(form.value));
const formCoordinateWarning = computed(() => {
  if (!formHasMissingCoordinates.value) return '';
  if (editingItem.value) {
    return '좌표가 없어 public 지도와 marker API에 표시되지 않습니다. 기존 데이터 편집은 가능하지만 위도와 경도를 보완해야 합니다.';
  }
  return `${currentConfig.value.label} 새 등록에는 위도와 경도가 필요합니다.`;
});

const emptyForm = () => ({
  name: '',
  description: '',
  imgUrl: '',
  imgObjectKey: '',
  categoryId: null,
  distilleryId: null,
  destinationId: null,
  countryId: null,
  cityId: null,
  address: '',
  latitude: null,
  longitude: null,
  strength: 0,
  size: 0,
  statedAge: '',
});

const setActiveTab = async (tabKey) => {
  activeTab.value = tabKey;
  resetForm();
  await fetchActiveItems();
};

const fetchOptions = async () => {
  const [categoryResponse, countryResponse, destinationResponse, distilleryResponse] = await Promise.all([
    apiService.get('categories'),
    apiService.get('countries'),
    apiService.get('destinations?size=200'),
    apiService.get('distilleries?size=200'),
  ]);
  categories.value = Array.isArray(categoryResponse) ? categoryResponse : [];
  countries.value = Array.isArray(countryResponse) ? countryResponse : [];
  destinations.value = destinationResponse?.content || [];
  distilleries.value = distilleryResponse?.content || [];
};

const fetchActiveItems = async () => {
  isLoading.value = true;
  message.value = '';
  try {
    const response = await apiService.get(`${currentConfig.value.endpoint}?size=200`);
    const items = response?.content || [];
    if (activeTab.value === 'alcohol') alcohols.value = items;
    if (activeTab.value === 'distillery') distilleries.value = items;
    if (activeTab.value === 'destination') destinations.value = items;
  } catch (error) {
    console.error('Content fetch failed:', error);
    showMessage('콘텐츠 목록을 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
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

  if (!editingItem.value && formHasMissingCoordinates.value) {
    showMessage(`${currentConfig.value.label} 새 등록에는 위도와 경도가 필요합니다.`, 'error');
    return;
  }

  isSaving.value = true;
  message.value = '';
  try {
    const payload = buildPayload();
    const endpoint = currentConfig.value.endpoint;
    if (editingItem.value) {
      await apiService.putWithToken(`${endpoint}/${editingItem.value.id}`, payload);
      showMessage(`${currentConfig.value.label} 정보를 수정했습니다.`);
    } else {
      await apiService.postWithToken(endpoint, payload);
      showMessage(`${currentConfig.value.label} 정보를 추가했습니다.`);
    }
    resetForm();
    await fetchOptions();
    await fetchActiveItems();
  } catch (error) {
    console.error('Content save failed:', error);
    showMessage('콘텐츠를 저장하지 못했습니다.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const buildPayload = () => {
  const base = {
    name: form.value.name,
    description: form.value.description,
    imgUrl: form.value.imgUrl,
    imgObjectKey: form.value.imgObjectKey,
  };

  if (activeTab.value === 'alcohol') {
    return {
      ...base,
      categoryId: form.value.categoryId,
      distilleryId: form.value.distilleryId,
      strength: Number(form.value.strength || 0),
      size: Number(form.value.size || 0),
      statedAge: form.value.statedAge,
    };
  }

  if (activeTab.value === 'distillery') {
    return {
      ...base,
      address: form.value.address,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      destinationId: form.value.destinationId,
    };
  }

  return {
    ...base,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
    cityId: form.value.cityId,
    categoryId: form.value.categoryId,
  };
};

const startEdit = async (item) => {
  editingItem.value = item;
  form.value = {
    ...emptyForm(),
    ...item,
    statedAge: item.statedAge || '',
  };
  if (activeTab.value === 'destination') {
    form.value.countryId = item.countryId || null;
    if (form.value.countryId) {
      await loadCitiesForCountry();
      form.value.cityId = item.cityId || null;
    }
  }
  message.value = '';
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
    body.append('itemType', activeTab.value.toUpperCase());
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

const deleteItem = async (item) => {
  if (!window.confirm(`${item.name} 항목을 삭제하시겠습니까?`)) return;
  try {
    await apiService.deleteWithToken(`${currentConfig.value.endpoint}/${item.id}`);
    showMessage(`${currentConfig.value.label} 항목을 삭제했습니다.`);
    if (editingItem.value?.id === item.id) {
      resetForm();
    }
    await fetchOptions();
    await fetchActiveItems();
  } catch (error) {
    console.error('Content delete failed:', error);
    showMessage('콘텐츠를 삭제하지 못했습니다.', 'error');
  }
};

const resetForm = () => {
  editingItem.value = null;
  form.value = emptyForm();
  newCountryName.value = '';
  newCityName.value = '';
};

const itemMeta = (item) => {
  if (activeTab.value === 'alcohol') return `카테고리 ${item.categoryId || '-'} / 양조장 ${item.distilleryId || '-'}`;
  if (activeTab.value === 'distillery') return `여행지 ${item.destinationId || '-'} / ${coordinateMeta(item)}`;
  return `${item.countryName || '-'} ${item.cityName || ''} / ${coordinateMeta(item)}`;
};

const hasMissingCoordinates = (item) => {
  if (!item || activeTab.value === 'alcohol') return false;
  return item.latitude == null || item.longitude == null || item.latitude === '' || item.longitude === '';
};

const coordinateMeta = (item) => {
  if (hasMissingCoordinates(item)) return '좌표 없음';
  return `${item.latitude}, ${item.longitude}`;
};

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
  await fetchOptions();
  await fetchActiveItems();
});
</script>
