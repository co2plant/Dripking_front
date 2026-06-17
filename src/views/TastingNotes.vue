<template>
  <main class="min-h-screen bg-zinc-50">
    <section class="border-b border-zinc-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold text-amber-600">Tasting Notes</p>
            <h1 class="mt-2 text-3xl font-bold text-zinc-950 sm:text-4xl">테이스팅 노트</h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              마신 술의 향, 맛, 여운, 페어링을 기록하고 다시 찾을 수 있습니다.
            </p>
          </div>
          <router-link
              :to="{ name: 'alcoholList' }"
              class="inline-flex w-fit items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100"
          >
            술 둘러보기
          </router-link>
        </div>

        <div class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">기록 수</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ notes.length }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">평균 총점</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ averageOverall }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">최근 테이스팅</p>
            <p class="mt-2 text-2xl font-bold text-zinc-950">{{ recentTastingDate }}</p>
          </div>
          <div class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p class="text-xs font-semibold text-zinc-500">자주 남긴 표현</p>
            <div class="mt-2 flex min-h-8 flex-wrap items-center gap-2">
              <span
                  v-for="tag in topTags"
                  :key="tag"
                  class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                {{ tag }}
              </span>
              <span v-if="topTags.length === 0" class="text-sm font-semibold text-zinc-400">-</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-8">
      <form
          ref="formSection"
          class="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
          @submit.prevent="saveNote"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-zinc-500">{{ editingId ? '노트 수정' : '새 노트' }}</p>
            <h2 class="mt-1 text-xl font-bold text-zinc-950">테이스팅 기록</h2>
          </div>
          <button
              v-if="editingId"
              type="button"
              class="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              @click="resetForm"
          >
            <XMarkIcon class="h-4 w-4" aria-hidden="true" />
            취소
          </button>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">술 선택</span>
            <select
                v-model="form.alcoholId"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                @change="syncAlcoholName"
            >
              <option value="">직접 입력</option>
              <option v-for="alcohol in alcohols" :key="alcohol.id" :value="String(alcohol.id)">
                {{ alcohol.name }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">술 이름</span>
            <input
                v-model.trim="form.alcoholName"
                type="text"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="예: 이강주"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">테이스팅 날짜</span>
            <input
                v-model="form.tastedAt"
                type="date"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">장소</span>
            <input
                v-model.trim="form.place"
                type="text"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="예: 전주 여행"
            />
          </label>
        </div>

        <p v-if="alcoholLoadError" class="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {{ alcoholLoadError }}
        </p>
        <p v-if="tagLoadError" class="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {{ tagLoadError }}
        </p>

        <div class="mt-6 grid gap-4">
          <div
              v-for="field in ratingFields"
              :key="field.key"
              class="rounded-md border border-zinc-200 px-4 py-3"
          >
            <div class="flex items-center justify-between gap-3">
              <label :for="field.key" class="text-sm font-semibold text-zinc-800">{{ field.label }}</label>
              <span class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
                {{ form[field.key] }} / 5
              </span>
            </div>
            <input
                :id="field.key"
                :value="form[field.key]"
                type="range"
                min="1"
                max="5"
                step="1"
                class="mt-3 w-full accent-amber-500"
                @input="setRatingField(field.key, $event.target.value)"
            />
          </div>
        </div>

        <div class="mt-6 grid gap-5">
          <div v-for="group in tagGroups" :key="group.field">
            <p class="text-sm font-semibold text-zinc-800">{{ group.label }}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                  v-for="tag in group.options"
                  :key="tag"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
                  :class="isTagSelected(group.field, tag)
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'"
                  @click="toggleTag(group.field, tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">페어링</span>
            <input
                v-model.trim="form.pairing"
                type="text"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="예: 전, 치즈, 과일"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-zinc-700">메모</span>
            <textarea
                v-model.trim="form.memo"
                rows="5"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="향, 첫 맛, 목넘김, 다시 마시고 싶은 상황을 기록하세요."
            ></textarea>
          </label>
        </div>

        <p v-if="formError" class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ formError }}
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              @click="resetForm"
          >
            <XMarkIcon class="h-4 w-4" aria-hidden="true" />
            초기화
          </button>
          <button
              type="submit"
              class="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <CheckIcon class="h-4 w-4" aria-hidden="true" />
            {{ editingId ? '수정 저장' : '노트 저장' }}
          </button>
        </div>
      </form>

      <div class="min-w-0">
        <div class="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-zinc-500">저장된 노트</p>
              <h2 class="mt-1 text-xl font-bold text-zinc-950">내 테이스팅 기록</h2>
            </div>
            <label class="block sm:w-48">
              <span class="text-sm font-semibold text-zinc-700">정렬</span>
              <select
                  v-model="sortBy"
                  class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="recent">최근순</option>
                <option value="score">총점순</option>
                <option value="name">이름순</option>
              </select>
            </label>
          </div>

          <label class="mt-4 block">
            <span class="text-sm font-semibold text-zinc-700">검색</span>
            <input
                v-model.trim="searchText"
                type="search"
                class="mt-1 block w-full rounded-md border-zinc-300 text-sm shadow-sm focus:border-amber-500 focus:ring-amber-500"
                placeholder="술 이름, 장소, 태그 검색"
            />
          </label>
        </div>

        <div v-if="isLoadingAlcohols" class="mt-4 rounded-md border border-zinc-200 bg-white px-4 py-6 text-center text-sm text-zinc-500">
          술 목록을 불러오는 중입니다.
        </div>

        <div v-if="filteredNotes.length === 0" class="mt-4 rounded-md border border-dashed border-zinc-300 bg-white px-5 py-12 text-center">
          <p class="text-base font-semibold text-zinc-900">저장된 테이스팅 노트가 없습니다.</p>
          <p class="mt-2 text-sm text-zinc-500">첫 잔의 향과 여운을 남겨보세요.</p>
        </div>

        <div v-else class="mt-4 grid gap-4">
          <article
              v-for="note in filteredNotes"
              :key="note.id"
              class="rounded-md border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate text-lg font-bold text-zinc-950">{{ note.alcoholName }}</h3>
                  <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                    총점 {{ note.overall }} / 5
                  </span>
                </div>
                <p class="mt-1 text-sm text-zinc-500">
                  {{ formatDisplayDate(note.tastedAt) }}
                  <span v-if="note.place"> · {{ note.place }}</span>
                </p>
              </div>
              <div class="flex shrink-0 gap-2">
                <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                    @click="editNote(note)"
                >
                  <PencilSquareIcon class="h-4 w-4" aria-hidden="true" />
                  수정
                </button>
                <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    @click="deleteNote(note.id)"
                >
                  <TrashIcon class="h-4 w-4" aria-hidden="true" />
                  삭제
                </button>
              </div>
            </div>

            <div class="mt-4 grid gap-3 text-sm text-zinc-700 sm:grid-cols-4">
              <p><span class="font-semibold text-zinc-900">색/질감</span> {{ note.appearance }}</p>
              <p><span class="font-semibold text-zinc-900">향</span> {{ note.aroma }}</p>
              <p><span class="font-semibold text-zinc-900">맛</span> {{ note.palate }}</p>
              <p><span class="font-semibold text-zinc-900">여운</span> {{ note.finish }}</p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span
                  v-for="tag in getNoteTags(note)"
                  :key="`${note.id}-${tag}`"
                  class="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
              >
                {{ tag }}
              </span>
            </div>

            <p v-if="note.pairing" class="mt-4 text-sm text-zinc-700">
              <span class="font-semibold text-zinc-950">페어링</span> {{ note.pairing }}
            </p>
            <p v-if="note.memo" class="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-700">
              {{ note.memo }}
            </p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon} from '@heroicons/vue/24/outline';
import {apiService} from '@/services/api';
import {
  buildTastingNoteTagGroups,
  DEFAULT_TASTING_NOTE_TAG_GROUPS,
  TASTING_NOTE_RATING_FIELDS
} from '@/constants/tastingNotes';

const STORAGE_KEY = 'dripking:tasting-notes';

const route = useRoute();
const formSection = ref(null);
const alcohols = ref([]);
const notes = ref([]);
const isLoadingAlcohols = ref(false);
const alcoholLoadError = ref('');
const tagLoadError = ref('');
const formError = ref('');
const editingId = ref('');
const searchText = ref('');
const sortBy = ref('recent');

const today = () => new Date().toISOString().slice(0, 10);

const createBlankForm = () => ({
  alcoholId: '',
  alcoholName: '',
  tastedAt: today(),
  place: '',
  appearance: 3,
  aroma: 3,
  palate: 3,
  finish: 3,
  overall: 3,
  aromaTags: [],
  palateTags: [],
  finishTags: [],
  pairing: '',
  memo: ''
});

const form = ref(createBlankForm());

const ratingFields = TASTING_NOTE_RATING_FIELDS;
const tagGroups = ref(DEFAULT_TASTING_NOTE_TAG_GROUPS);

const createId = () => `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeNumber = (value, fallback = 3) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(5, Math.max(1, numericValue));
};

const normalizeTags = (tags) => Array.isArray(tags) ? tags.filter(Boolean) : [];

const normalizeNote = (note) => ({
  id: note.id || createId(),
  alcoholId: note.alcoholId ? String(note.alcoholId) : '',
  alcoholName: note.alcoholName || '',
  tastedAt: note.tastedAt || today(),
  place: note.place || '',
  appearance: normalizeNumber(note.appearance),
  aroma: normalizeNumber(note.aroma),
  palate: normalizeNumber(note.palate),
  finish: normalizeNumber(note.finish),
  overall: normalizeNumber(note.overall),
  aromaTags: normalizeTags(note.aromaTags),
  palateTags: normalizeTags(note.palateTags),
  finishTags: normalizeTags(note.finishTags),
  pairing: note.pairing || '',
  memo: note.memo || '',
  createdAt: note.createdAt || new Date().toISOString(),
  updatedAt: note.updatedAt || note.createdAt || new Date().toISOString()
});

const persistNotes = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value));
};

const loadNotes = () => {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    notes.value = Array.isArray(savedNotes) ? savedNotes.map(normalizeNote) : [];
  } catch (error) {
    console.error('테이스팅 노트를 불러오지 못했습니다.', error);
    notes.value = [];
  }
};

const loadAlcohols = async () => {
  isLoadingAlcohols.value = true;
  alcoholLoadError.value = '';

  try {
    const response = await apiService.get('alcohols?page=0&size=100&sort=DESC');
    alcohols.value = Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response)
            ? response
            : [];
  } catch (error) {
    console.error('술 목록을 불러오지 못했습니다.', error);
    alcohols.value = [];
    alcoholLoadError.value = '술 목록을 불러오지 못했습니다. 이름은 직접 입력할 수 있습니다.';
  } finally {
    isLoadingAlcohols.value = false;
  }
};

const loadTagGroups = async () => {
  tagLoadError.value = '';

  try {
    const response = await apiService.get('tags');
    tagGroups.value = buildTastingNoteTagGroups(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error('테이스팅 태그를 불러오지 못했습니다.', error);
    tagGroups.value = DEFAULT_TASTING_NOTE_TAG_GROUPS;
    tagLoadError.value = '태그 목록을 불러오지 못했습니다. 기본 태그로 표시합니다.';
  }
};

const findAlcoholById = (alcoholId) => {
  return alcohols.value.find((alcohol) => String(alcohol.id) === String(alcoholId));
};

const syncAlcoholName = () => {
  const selectedAlcohol = findAlcoholById(form.value.alcoholId);
  if (selectedAlcohol) {
    form.value.alcoholName = selectedAlcohol.name;
  }
};

const applyRouteAlcohol = async () => {
  if (editingId.value || !route.query.alcoholId) return;

  form.value.alcoholId = String(route.query.alcoholId);
  syncAlcoholName();

  if (form.value.alcoholName) return;

  try {
    const alcohol = await apiService.get(`alcohols/${route.query.alcoholId}`);
    form.value.alcoholName = alcohol?.name || '';
  } catch (error) {
    console.error('선택한 술 정보를 불러오지 못했습니다.', error);
  }
};

const setRatingField = (fieldKey, value) => {
  form.value[fieldKey] = normalizeNumber(value);
};

const isTagSelected = (field, tag) => form.value[field].includes(tag);

const toggleTag = (field, tag) => {
  const selectedTags = form.value[field];
  form.value[field] = selectedTags.includes(tag)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedTags, tag];
};

const getNoteTags = (note) => [
  ...normalizeTags(note.aromaTags),
  ...normalizeTags(note.palateTags),
  ...normalizeTags(note.finishTags)
];

const saveNote = () => {
  formError.value = '';

  if (!form.value.alcoholName.trim()) {
    formError.value = '술 이름을 입력해주세요.';
    return;
  }

  const now = new Date().toISOString();
  const existingNote = editingId.value
      ? notes.value.find((note) => note.id === editingId.value)
      : null;

  const nextNote = normalizeNote({
    ...form.value,
    id: editingId.value || createId(),
    createdAt: existingNote?.createdAt || now,
    updatedAt: now
  });

  notes.value = editingId.value
      ? notes.value.map((note) => note.id === editingId.value ? nextNote : note)
      : [nextNote, ...notes.value];

  persistNotes();
  resetForm();
};

const editNote = (note) => {
  editingId.value = note.id;
  form.value = {
    alcoholId: note.alcoholId,
    alcoholName: note.alcoholName,
    tastedAt: note.tastedAt,
    place: note.place,
    appearance: note.appearance,
    aroma: note.aroma,
    palate: note.palate,
    finish: note.finish,
    overall: note.overall,
    aromaTags: [...normalizeTags(note.aromaTags)],
    palateTags: [...normalizeTags(note.palateTags)],
    finishTags: [...normalizeTags(note.finishTags)],
    pairing: note.pairing,
    memo: note.memo
  };
  formError.value = '';
  formSection.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
};

const deleteNote = (noteId) => {
  if (!window.confirm('이 테이스팅 노트를 삭제할까요?')) return;
  notes.value = notes.value.filter((note) => note.id !== noteId);
  persistNotes();

  if (editingId.value === noteId) {
    resetForm();
  }
};

const resetForm = () => {
  editingId.value = '';
  formError.value = '';
  form.value = createBlankForm();
  applyRouteAlcohol();
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const averageOverall = computed(() => {
  if (notes.value.length === 0) return '-';
  const total = notes.value.reduce((sum, note) => sum + normalizeNumber(note.overall), 0);
  return (total / notes.value.length).toFixed(1);
});

const recentTastingDate = computed(() => {
  if (notes.value.length === 0) return '-';
  const [latestNote] = [...notes.value].sort((a, b) => String(b.tastedAt).localeCompare(String(a.tastedAt)));
  return formatDisplayDate(latestNote.tastedAt);
});

const topTags = computed(() => {
  const tagCounts = new Map();
  notes.value.forEach((note) => {
    getNoteTags(note).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return [...tagCounts.entries()]
      .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], 'ko-KR'))
      .slice(0, 3)
      .map(([tag]) => tag);
});

const filteredNotes = computed(() => {
  const keyword = searchText.value.trim().toLowerCase();
  const nextNotes = [...notes.value].filter((note) => {
    if (!keyword) return true;
    return [
      note.alcoholName,
      note.place,
      note.pairing,
      note.memo,
      ...getNoteTags(note)
    ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
  });

  if (sortBy.value === 'score') {
    return nextNotes.sort((a, b) => normalizeNumber(b.overall) - normalizeNumber(a.overall));
  }

  if (sortBy.value === 'name') {
    return nextNotes.sort((a, b) => a.alcoholName.localeCompare(b.alcoholName, 'ko-KR'));
  }

  return nextNotes.sort((a, b) => String(b.tastedAt).localeCompare(String(a.tastedAt)));
});

watch(
    () => route.query.alcoholId,
    () => {
      applyRouteAlcohol();
    }
);

onMounted(async () => {
  loadNotes();
  await Promise.all([
    loadAlcohols(),
    loadTagGroups()
  ]);
  await applyRouteAlcohol();
});
</script>
