<template>
  <main class="mx-auto max-w-7xl px-4 py-8 text-left">
    <section class="mb-8 border-b border-zinc-200 pb-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-amber-600">Course Autopilot</p>
          <h1 class="mt-2 text-3xl font-bold text-zinc-950">AI 코스 만들기</h1>
          <p class="mt-2 text-sm text-zinc-600">기간, 지역, 취향, 위시리스트를 조합해 코스 생성 요청을 준비합니다.</p>
        </div>
        <router-link
            :to="{ name: 'tripCreate' }"
            class="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          여행 만들기
        </router-link>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form class="grid gap-6" @submit.prevent="generateCourse">
        <section class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <calendar-days-icon class="h-5 w-5 text-amber-600" />
            <h2 class="text-base font-bold text-zinc-950">기간</h2>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">출발일</span>
              <input
                  v-model="courseDraftStore.draft.startDate"
                  type="date"
                  :min="today"
                  class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  @change="syncEndDate"
              />
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">도착일</span>
              <input
                  v-model="courseDraftStore.draft.endDate"
                  type="date"
                  :min="courseDraftStore.draft.startDate || today"
                  class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  @change="courseDraftStore.clearPreparedPayload"
              />
            </label>
          </div>
        </section>

        <section class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <map-pin-icon class="h-5 w-5 text-amber-600" />
            <h2 class="text-base font-bold text-zinc-950">지역</h2>
          </div>
          <div class="grid gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">국가</span>
              <select
                  v-model.number="courseDraftStore.draft.countryId"
                  class="h-11 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  @change="syncCountryFromSelection"
              >
                <option :value="0">국가 선택</option>
                <option v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name }}
                </option>
              </select>
            </label>
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-zinc-900">지역 힌트</span>
              <input
                  v-model.trim="courseDraftStore.draft.regionHint"
                  type="text"
                  maxlength="40"
                  placeholder="예: 제주, 교토, 도쿄"
                  class="h-11 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  @input="courseDraftStore.clearPreparedPayload"
              />
            </label>
          </div>
        </section>

        <section class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center gap-2">
            <sparkles-icon class="h-5 w-5 text-amber-600" />
            <h2 class="text-base font-bold text-zinc-950">취향</h2>
          </div>
          <div v-if="isLoadingBaseData" class="rounded-md bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            취향 선택지를 불러오는 중입니다.
          </div>
          <div v-else class="grid gap-6">
            <fieldset>
              <legend class="text-sm font-semibold text-zinc-900">주류 카테고리</legend>
              <div v-if="categories.length === 0" class="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                표시할 카테고리가 없습니다.
              </div>
              <div v-else class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="flex min-h-16 items-start justify-between gap-3 rounded-md border px-4 py-3 text-left transition-colors"
                    :class="isCategorySelected(category.id) ? 'border-amber-400 bg-amber-50 text-zinc-950' : 'border-zinc-200 bg-white text-zinc-700 hover:border-amber-300'"
                    @click="courseDraftStore.toggleCategory(category.id)"
                >
                  <span>
                    <span class="block text-sm font-semibold">{{ category.name }}</span>
                    <span class="mt-1 line-clamp-2 block text-xs text-zinc-500">{{ category.description || '설명 없음' }}</span>
                  </span>
                  <check-icon v-if="isCategorySelected(category.id)" class="h-5 w-5 shrink-0 text-amber-600" />
                </button>
              </div>
            </fieldset>

            <fieldset>
              <legend class="text-sm font-semibold text-zinc-900">맛 태그</legend>
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                    v-for="tag in flavorTagOptions"
                    :key="tag.value"
                    type="button"
                    class="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors"
                    :class="isFlavorTagSelected(tag.value) ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'"
                    @click="courseDraftStore.toggleFlavorTag(tag.value)"
                >
                  <check-icon v-if="isFlavorTagSelected(tag.value)" class="h-4 w-4" />
                  {{ tag.label }}
                </button>
              </div>
            </fieldset>
          </div>
        </section>

        <section class="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <heart-icon class="h-5 w-5 text-amber-600" />
              <h2 class="text-base font-bold text-zinc-950">위시리스트</h2>
            </div>
            <span class="rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">{{ selectedWishlistCount }}</span>
          </div>

          <div v-if="isLoadingWishlist" class="rounded-md bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            위시리스트를 불러오는 중입니다.
          </div>
          <div v-else-if="wishlistItems.length === 0" class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            담아둔 항목이 없습니다.
          </div>
          <div v-else class="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
            <label
                v-for="item in wishlistItems"
                :key="`${item.itemType}-${item.targetId || item.id}`"
                class="grid cursor-pointer grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-3 transition-colors"
                :class="wishlistItemId(item) ? (isWishlistSelected(item) ? 'border-amber-400 bg-amber-50' : 'border-zinc-200 bg-white hover:border-amber-300') : 'cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-70'"
            >
              <input
                  type="checkbox"
                  class="sr-only"
                  :disabled="!wishlistItemId(item)"
                  :checked="isWishlistSelected(item)"
                  @change="toggleWishlistSelection(item)"
              />
              <div class="h-16 w-16 overflow-hidden rounded-md bg-zinc-100">
                <img v-if="item.imgUrl" :src="item.imgUrl" :alt="item.name" class="h-full w-full object-cover" />
              </div>
              <span class="min-w-0">
                <span class="mb-1 inline-flex rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">{{ displayItemType(item.itemType) }}</span>
                <span class="block truncate text-sm font-semibold text-zinc-950">{{ item.name || '이름 없음' }}</span>
                <span class="mt-1 line-clamp-1 block text-xs text-zinc-500">{{ item.address || item.description || '위치 정보 없음' }}</span>
              </span>
              <span v-if="isWishlistSelected(item)" class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-zinc-950">
                <check-icon class="h-4 w-4" />
              </span>
              <span v-else-if="!wishlistItemId(item)" class="text-xs font-semibold text-zinc-500">동기화 필요</span>
            </label>
          </div>
        </section>

        <div v-if="courseDraftStore.validationErrors.length" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p v-for="error in courseDraftStore.validationErrors" :key="error">{{ error }}</p>
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              @click="resetDraft"
          >
            <rotate-ccw-icon class="h-4 w-4" />
            초기화
          </button>
          <button
              type="submit"
              :disabled="isGeneratingCourse"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-amber-400 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            <wand-sparkles-icon class="h-4 w-4" />
            {{ isGeneratingCourse ? '코스 생성 중...' : '코스 생성' }}
          </button>
        </div>
      </form>

      <aside class="h-fit rounded-md border border-zinc-200 bg-zinc-50 p-5">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-bold text-zinc-950">요청 요약</h2>
          <span class="rounded bg-white px-2 py-1 text-xs font-semibold text-zinc-600">{{ courseDraftStore.durationDays || 0 }}일</span>
        </div>

        <dl class="mt-5 grid gap-4 text-sm">
          <div>
            <dt class="text-xs font-semibold uppercase text-zinc-500">Dates</dt>
            <dd class="mt-1 font-medium text-zinc-900">{{ courseDraftStore.draft.startDate }} ~ {{ courseDraftStore.draft.endDate }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase text-zinc-500">Region</dt>
            <dd class="mt-1 font-medium text-zinc-900">{{ courseDraftStore.draft.countryName || '국가 미선택' }}</dd>
            <dd v-if="courseDraftStore.draft.regionHint" class="mt-1 text-zinc-600">{{ courseDraftStore.draft.regionHint }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase text-zinc-500">Taste</dt>
            <dd class="mt-2 flex flex-wrap gap-2">
              <span v-for="name in selectedCategoryNames" :key="`category-${name}`" class="rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700">{{ name }}</span>
              <span v-for="label in selectedFlavorLabels" :key="`tag-${label}`" class="rounded bg-white px-2 py-1 text-xs font-medium text-zinc-700">{{ label }}</span>
              <span v-if="selectedCategoryNames.length === 0 && selectedFlavorLabels.length === 0" class="text-sm text-zinc-500">선택 없음</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase text-zinc-500">Wishlist</dt>
            <dd class="mt-1 font-medium text-zinc-900">{{ selectedWishlistCount }}개 선택</dd>
          </div>
        </dl>

        <div v-if="isGeneratingCourse" class="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p class="font-semibold">코스를 생성하는 중입니다.</p>
          <p class="mt-1">취향과 위시리스트를 바탕으로 일정 초안을 구성합니다.</p>
        </div>

        <div v-if="generationSuccessMessage" class="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p class="font-semibold">{{ generationSuccessMessage }}</p>
          <p class="mt-1">{{ generatedPlanCount }}개 항목을 {{ generatedDayCount }}일 일정으로 구성했습니다.</p>
        </div>

        <div v-if="errorMessage" class="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {{ errorMessage }}
        </div>
      </aside>
    </div>

    <section v-if="generationResult" class="mt-8 rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-semibold text-amber-600">생성 결과 미리보기</p>
          <h2 class="mt-1 text-xl font-bold text-zinc-950">{{ generationResult.countryName }} 코스 초안</h2>
          <p class="mt-2 text-sm text-zinc-600">
            {{ generationResult.startDate }} ~ {{ generationResult.endDate }}
            <span v-if="generationResult.regionHint"> · {{ generationResult.regionHint }}</span>
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="w-fit rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
            {{ generatedPlanCount }}개 항목
          </span>
          <button
              type="button"
              :disabled="isSavingCourse || generatedPlanCount === 0"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
              @click="saveGeneratedCourse"
          >
            <save-icon class="h-4 w-4" />
            {{ isSavingCourse ? '저장 중...' : '내 여행으로 저장' }}
          </button>
        </div>
      </div>

      <div v-if="isSavingCourse" class="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        생성된 코스를 여행과 일정으로 저장하는 중입니다.
      </div>

      <dl class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
            v-for="item in generationMetaItems"
            :key="item.label"
            class="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3"
        >
          <dt class="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <component :is="item.icon" class="h-4 w-4 text-amber-600" />
            {{ item.label }}
          </dt>
          <dd class="mt-1 truncate text-sm font-semibold text-zinc-950">{{ item.value }}</dd>
        </div>
      </dl>

      <div v-if="generatedPlanCount === 0" class="mt-5 rounded-md bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
        생성된 일정 항목이 없습니다. 지역 또는 취향 조건을 바꿔 다시 생성해보세요.
      </div>

      <div v-else class="mt-5 grid gap-4 lg:grid-cols-2">
        <article
            v-for="day in generationResult.days"
            :key="`course-day-${day.day}`"
            class="rounded-md border border-zinc-200 bg-zinc-50 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-sm font-bold text-zinc-950">Day {{ day.day }}</h3>
            <span class="rounded bg-white px-2 py-1 text-xs font-semibold text-zinc-600">{{ day.date }}</span>
          </div>

          <div v-if="!day.plans || day.plans.length === 0" class="mt-4 rounded-md bg-white px-3 py-6 text-center text-sm text-zinc-500">
            배치된 항목이 없습니다.
          </div>

          <ol v-else class="mt-4 grid gap-3">
            <li
                v-for="plan in day.plans"
                :key="`course-plan-${day.day}-${plan.order}-${plan.itemType}-${plan.targetId}`"
                class="grid grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-md bg-white p-3"
            >
              <span class="grid gap-1 justify-items-center">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  {{ plan.order }}
                </span>
                <span class="text-[11px] font-semibold text-zinc-500">{{ displayPlanTime(plan) }}</span>
              </span>
              <span class="min-w-0">
                <span class="mb-1 flex flex-wrap items-center gap-2">
                  <span class="inline-flex rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                    {{ displayItemType(plan.itemType) }}
                  </span>
                  <span
                      v-if="displayTravelMinutes(plan)"
                      class="inline-flex items-center gap-1 rounded bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700"
                  >
                    <route-icon class="h-3 w-3" />
                    {{ displayTravelMinutes(plan) }}
                  </span>
                </span>
                <span class="block truncate text-sm font-semibold text-zinc-950">{{ plan.name || '이름 없음' }}</span>
                <span class="mt-1 line-clamp-2 block text-xs text-zinc-500">{{ plan.description || '설명 없음' }}</span>
                <span class="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span>ID {{ plan.targetId }}</span>
                  <span v-if="plan.rating">평점 {{ plan.rating }}</span>
                  <span v-if="plan.source">{{ displayPlanSource(plan.source) }}</span>
                </span>
              </span>
            </li>
          </ol>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {
  CalendarDays as CalendarDaysIcon,
  Check as CheckIcon,
  Coins as CoinsIcon,
  Hash as HashIcon,
  Heart as HeartIcon,
  MapPin as MapPinIcon,
  RotateCcw as RotateCcwIcon,
  Route as RouteIcon,
  Save as SaveIcon,
  Sparkles as SparklesIcon,
  Wallet as WalletIcon,
  WandSparkles as WandSparklesIcon,
} from 'lucide-vue-next';
import Plan from '@/composables/Entity/Plan';
import Trip from '@/composables/Entity/Trip';
import {apiService, resolveApiErrorMessage} from '@/services/api';
import {FLAVOR_TAG_OPTIONS} from '@/constants/tasteOptions';
import {useAuthStore} from '@/stores/useAuthStore';
import {useCourseDraftStore} from '@/stores/useCourseDraftStore';
import {usePlanStore} from '@/stores/usePlanStore';
import {useTasteProfileStore} from '@/stores/useTasteProfileStore';
import {useTripStore} from '@/stores/useTripStore';
import {useWishStore} from '@/stores/useWishStore';

const router = useRouter();
const authStore = useAuthStore();
const courseDraftStore = useCourseDraftStore();
const planStore = usePlanStore();
const tasteProfileStore = useTasteProfileStore();
const tripStore = useTripStore();
const wishStore = useWishStore();

const categories = ref([]);
const countries = ref([]);
const isLoadingBaseData = ref(false);
const isLoadingWishlist = ref(false);
const isGeneratingCourse = ref(false);
const isSavingCourse = ref(false);
const errorMessage = ref('');
const generationSuccessMessage = ref('');
const generationResult = ref(null);
const flavorTagOptions = FLAVOR_TAG_OPTIONS;

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = computed(() => formatDateInput(new Date()));

const selectedCountry = computed(() => countries.value
    .find(country => Number(country.id) === Number(courseDraftStore.draft.countryId)));

const wishlistItems = computed(() => wishStore.WishItems);

const selectedWishlistCount = computed(() => courseDraftStore.draft.wishlistItemIds.length);

const selectedCategoryNames = computed(() => categories.value
    .filter(category => courseDraftStore.draft.categories.includes(Number(category.id)))
    .map(category => category.name));

const selectedFlavorLabels = computed(() => flavorTagOptions
    .filter(tag => courseDraftStore.draft.flavorTags.includes(tag.value))
    .map(tag => tag.label));

const generatedDayCount = computed(() => Array.isArray(generationResult.value?.days)
    ? generationResult.value.days.length
    : 0);

const generatedPlanCount = computed(() => Array.isArray(generationResult.value?.days)
    ? generationResult.value.days.reduce((count, day) => count + (Array.isArray(day.plans) ? day.plans.length : 0), 0)
    : 0);

const displayItemType = (itemType) => ({
  ALCOHOL: '술',
  DESTINATION: '여행지',
  DISTILLERY: '양조장',
  PLACE: '장소',
}[itemType] || itemType);

const displayPlanSource = (source) => ({
  WISHLIST: '위시리스트',
  RECOMMENDATION: '추천',
}[source] || source);

const displayCredit = (value, emptyText) => {
  if (value === null || value === undefined || value === '') {
    return emptyText;
  }
  const credit = Number(value);
  return Number.isFinite(credit) ? `${credit} 크레딧` : emptyText;
};

const normalizedPlanTime = (time) => {
  if (typeof time !== 'string') {
    return null;
  }
  const trimmedTime = time.trim();
  return /^\d{2}:\d{2}$/.test(trimmedTime) ? trimmedTime : null;
};

const fallbackPlanTime = (order) => {
  const baseHour = 9;
  const hour = Math.min(21, baseHour + Math.max(0, Number(order || 1) - 1) * 2);
  return `${String(hour).padStart(2, '0')}:00`;
};

const planStartTime = (planOrOrder) => {
  if (typeof planOrOrder === 'object' && planOrOrder !== null) {
    return normalizedPlanTime(planOrOrder.time) || fallbackPlanTime(planOrOrder.order);
  }
  return fallbackPlanTime(planOrOrder);
};

const planEndTime = (planOrOrder) => {
  const [hour, minute] = planStartTime(planOrOrder).split(':').map(Number);
  return `${String(Math.min(22, hour + 1)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const displayPlanTime = (plan) => planStartTime(plan);

const displayTravelMinutes = (plan) => {
  const minutes = Number(plan?.travelMinutesFromPrev);
  if (!Number.isFinite(minutes)) {
    return '';
  }
  return minutes === 0 ? '첫 장소' : `이동 ${minutes}분`;
};

const generationMetaItems = computed(() => [
  {
    label: '코스 ID',
    value: generationResult.value?.courseId || '임시 ID 없음',
    icon: HashIcon,
  },
  {
    label: '차감 크레딧',
    value: displayCredit(generationResult.value?.creditCharged, '차감 정보 없음'),
    icon: CoinsIcon,
  },
  {
    label: '남은 크레딧',
    value: displayCredit(generationResult.value?.remainingCredit, '잔액 미연동'),
    icon: WalletIcon,
  },
  {
    label: '캐시 여부',
    value: generationResult.value?.cacheHit ? '캐시 재사용' : '새로 생성',
    icon: RotateCcwIcon,
  },
]);

const courseTripName = () => {
  const regionHint = generationResult.value?.regionHint || courseDraftStore.draft.regionHint;
  const countryName = generationResult.value?.countryName || courseDraftStore.draft.countryName;
  return regionHint ? `${countryName} ${regionHint} AI 코스` : `${countryName} AI 코스`;
};

const clearGenerationState = () => {
  generationResult.value = null;
  generationSuccessMessage.value = '';
};

const wishlistItemId = (item) => {
  const id = Number(item?.wishlistItemId);
  return Number.isFinite(id) ? id : null;
};

const isCategorySelected = (categoryId) => courseDraftStore.draft.categories.includes(Number(categoryId));

const isFlavorTagSelected = (tag) => courseDraftStore.draft.flavorTags.includes(tag);

const isWishlistSelected = (item) => {
  const id = wishlistItemId(item);
  return id !== null && courseDraftStore.draft.wishlistItemIds.includes(id);
};

const toggleWishlistSelection = (item) => {
  const id = wishlistItemId(item);
  if (id !== null) {
    courseDraftStore.toggleWishlistItem(id);
  }
};

const syncCountryFromSelection = () => {
  courseDraftStore.setCountry(selectedCountry.value);
};

const syncEndDate = () => {
  if (!courseDraftStore.draft.endDate || courseDraftStore.draft.endDate < courseDraftStore.draft.startDate) {
    courseDraftStore.draft.endDate = courseDraftStore.draft.startDate;
  }
  courseDraftStore.clearPreparedPayload();
};

watch(
    () => courseDraftStore.draft,
    clearGenerationState,
    {deep: true}
);

const loadBaseData = async () => {
  isLoadingBaseData.value = true;
  try {
    const [categoryResponse, countryResponse] = await Promise.all([
      apiService.get('categories'),
      apiService.get('countries'),
    ]);
    categories.value = Array.isArray(categoryResponse) ? categoryResponse : [];
    countries.value = Array.isArray(countryResponse) ? countryResponse : [];
  } catch (error) {
    categories.value = [];
    countries.value = [];
    errorMessage.value = resolveApiErrorMessage(error, '코스 생성 선택지를 불러오지 못했습니다.');
  } finally {
    isLoadingBaseData.value = false;
  }
};

const loadTasteProfile = async () => {
  await authStore.initAuth();
  if (!authStore.isAuthenticated()) {
    return;
  }

  const result = await tasteProfileStore.loadProfile();
  if (result.success) {
    courseDraftStore.setTaste(tasteProfileStore.profile.categories, tasteProfileStore.profile.flavorTags);
  }
};

const loadWishlist = async () => {
  isLoadingWishlist.value = true;
  try {
    await wishStore.loadWishlist();
    const availableIds = wishlistItems.value.map(wishlistItemId).filter(id => id !== null);
    courseDraftStore.setWishlistItemIds(courseDraftStore.draft.wishlistItemIds.filter(id => availableIds.includes(id)));
  } catch (error) {
    errorMessage.value = resolveApiErrorMessage(error, '위시리스트를 불러오지 못했습니다.');
  } finally {
    isLoadingWishlist.value = false;
  }
};

const generateCourse = async () => {
  syncCountryFromSelection();
  errorMessage.value = '';
  generationSuccessMessage.value = '';
  generationResult.value = null;

  const result = courseDraftStore.prepareGenerateRequest();
  if (!result.success) {
    return;
  }

  isGeneratingCourse.value = true;
  try {
    generationResult.value = await apiService.postWithOptionalToken('courses/generate', result.payload);
    generationSuccessMessage.value = '코스 생성이 완료되었습니다.';
  } catch (error) {
    errorMessage.value = resolveApiErrorMessage(error, '코스를 생성하지 못했습니다.');
  } finally {
    isGeneratingCourse.value = false;
  }
};

const saveGeneratedCourse = async () => {
  errorMessage.value = '';
  await authStore.initAuth();
  if (!authStore.isAuthenticated()) {
    errorMessage.value = '생성된 코스를 저장하려면 로그인해주세요.';
    return;
  }
  if (!generationResult.value || generatedPlanCount.value === 0) {
    errorMessage.value = '저장할 생성 결과가 없습니다.';
    return;
  }

  isSavingCourse.value = true;
  try {
    const trip = new Trip()
        .setName(courseTripName())
        .setDescription('AI 코스 생성 결과로 만든 여행입니다.')
        .setStartDate(generationResult.value.startDate)
        .setEndDate(generationResult.value.endDate)
        .setCountryId(courseDraftStore.draft.countryId)
        .setCountry(generationResult.value.countryName)
        .build();

    const createdTrip = await tripStore.addTrip(trip);
    if (!createdTrip) {
      throw new Error('여행을 저장하지 못했습니다.');
    }

    let sortOrder = 0;
    for (const day of generationResult.value.days || []) {
      for (const item of day.plans || []) {
        const plan = new Plan()
            .setName(item.name || displayItemType(item.itemType))
            .setDescription(item.description || '')
            .setPlanDate(day.date)
            .setStartTime(planStartTime(item))
            .setEndTime(planEndTime(item))
            .setTargetId(item.targetId)
            .setTripId(createdTrip.id)
            .setItemType(item.itemType)
            .build();
        plan.sort_order = sortOrder;
        sortOrder += 1;

        const createdPlan = await planStore.addPlan(plan);
        if (!createdPlan) {
          throw new Error('일정을 저장하지 못했습니다.');
        }
      }
    }

    await router.push({name: 'tripModify', params: {id: createdTrip.id}});
  } catch (error) {
    errorMessage.value = resolveApiErrorMessage(error, error.message || '생성된 코스를 저장하지 못했습니다.');
  } finally {
    isSavingCourse.value = false;
  }
};

const resetDraft = () => {
  courseDraftStore.resetDraft({
    startDate: today.value,
    endDate: today.value,
  });
};

onMounted(async () => {
  resetDraft();
  await Promise.all([
    loadBaseData(),
    loadTasteProfile(),
    loadWishlist(),
  ]);
});
</script>
