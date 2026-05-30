<template>
  <div class="mb-12">
    <div v-if="isLoading" class="rounded-md border border-zinc-200 bg-white px-4 py-16 text-center text-sm text-zinc-500">
      상세 정보를 불러오는 중입니다.
    </div>
    <div v-else-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-16 text-center text-sm text-red-700">
      {{ error }}
      <button
          type="button"
          @click="fetchItem"
          class="ml-2 font-medium underline"
      >
        다시 시도
      </button>
    </div>
    <div v-else-if="!item.id" class="rounded-md border border-zinc-200 bg-white px-4 py-16 text-center text-sm text-zinc-500">
      상세 정보를 찾을 수 없습니다.
    </div>
    <template v-else>
      <div class="relative h-96 mb-6">
        <img
            :src="getImageUrl(item)"
            :alt="item.name"
            class="rounded-lg object-cover w-full h-full shadow-lg"
        />
      </div>
      <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">{{ item.name }}</h1>
          <div class="mt-3 flex items-center gap-2 text-sm text-zinc-600">
            <span class="font-semibold text-zinc-900">평점 {{ formatRating(item.rating) }}</span>
          </div>
        </div>
        <button
            type="button"
            :disabled="!item.id"
            @click="toggleWishlist"
            class="rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
            :class="isWishlisted
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-amber-400 text-zinc-950 hover:bg-amber-500'"
        >
          {{ isWishlisted ? '위시리스트 해제' : '위시리스트 추가' }}
        </button>
      </div>
      <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>
    </template>
  </div>
</template>

<script setup>
import {computed, defineProps, onMounted, ref} from "vue";
import { apiService } from "@/services/api";
import { recordInteractionEvent } from "@/services/interactionEvents";
import {useWishStore} from "@/stores/useWishStore";

const ItemTypes = {
  DESTINATION: 'destinations',
  ALCOHOL: 'alcohols',
  DISTILLERY: 'distilleries'
}

const props = defineProps({
  itemType: {
    type: String,
    required: true
  },
  targetId: {
    type: [String, Number],
    required: true
  }
});

const wishStore = useWishStore();
const item = ref({});
const isLoading = ref(false);
const error = ref('');
const getImageUrl = (item) => item.imgUrl || item.img_url;

const isWishlisted = computed(() => {
  return item.value?.id != null && wishStore.isInWishlist(item.value, props.itemType);
});

const formatRating = (rating) => {
  const numericRating = Number(rating);
  return Number.isFinite(numericRating) ? numericRating.toFixed(1) : '0.0';
};

const toggleWishlist = async () => {
  if (item.value?.id == null) return;
  await wishStore.toggleWishlist(item.value, props.itemType);
};

const fetchItem = async () => {
  const resource = ItemTypes[props.itemType];
  if (!resource) {
    error.value = '지원하지 않는 상세 유형입니다.';
    item.value = {};
    return;
  }

  isLoading.value = true;
  error.value = '';
  try {
    item.value = await apiService.get(`${resource}/${props.targetId}`) || {};
    if (item.value?.id != null) {
      recordInteractionEvent(props.itemType, props.targetId, 'DETAIL_VIEW');
    }
  } catch (err) {
    console.error('상세 정보를 불러오는 중 오류 발생:', err);
    item.value = {};
    error.value = '상세 정보를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await wishStore.loadWishlist();
  await fetchItem();
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
