<template>
  <div
      class="mb-6">
    <h3 class="text-2xl font-semibold mb-6 text-gray-800">{{propsRef.title}}</h3>
    <div v-if="isLoading" class="rounded-md border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500">
      관련 콘텐츠를 불러오는 중입니다.
    </div>
    <div v-else-if="error" class="rounded-md border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
      {{ error }}
      <button
          type="button"
          @click="fetchItems"
          class="ml-2 font-medium underline"
      >
        다시 시도
      </button>
    </div>
    <div v-else-if="!items.length" class="rounded-md border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500">
      {{ propsRef.emptyText || '표시할 관련 콘텐츠가 없습니다.' }}
    </div>
    <div v-else class="relative">
      <div
          class="flex overflow-x-auto space-x-6 p-6 scrollbar-hide scroll-smooth"
          @touchstart="touchStart"
          @touchmove="touchMove"
          @touchend="touchEnd"
          ref="scrollContainer"
      >
        <router-link
            v-for="item in items"
            :key="item.id"
            :to="{name: toName, params: { id: item.id }}"
            class="flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
        >
          <div class="relative h-48 overflow-hidden">
            <img
                :src="getImageUrl(item)"
                :alt="item.name"
                class="w-full h-full object-cover"
            />
          </div>
          <div class="p-6">
            <h3 class="font-bold text-xl mb-2 text-gray-800">{{ item.name }}</h3>
            <p class="text-gray-600">{{ item.description }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, onMounted, ref} from "vue";
import {apiService} from "@/services/api";

const props = defineProps(['title', 'toName', 'urlStr', 'emptyText']);
const propsRef = ref(props);
const items = ref([]);
const isLoading = ref(false);
const error = ref('');
const getImageUrl = (item) => item.imgUrl || item.img_url;

const scrollContainer = ref(null)
let isScrolling = false
let startX
let scrollLeft

const touchStart = (e) => {
  if (!scrollContainer.value) return
  isScrolling = true
  startX = e.touches[0].pageX - scrollContainer.value.offsetLeft
  scrollLeft = scrollContainer.value.scrollLeft
}

const touchMove = (e) => {
  if (!isScrolling || !scrollContainer.value) return
  e.preventDefault()
  const x = e.touches[0].pageX - scrollContainer.value.offsetLeft
  const walk = (x - startX) * 2 // 스크롤 속도 조절
  scrollContainer.value.scrollLeft = scrollLeft - walk
}

const touchEnd = () => {
  isScrolling = false
}

const fetchItems = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const data = await apiService.get(props.urlStr);
    items.value = data?.content || [];
  } catch (err) {
    console.error("API 호출 오류:", err);
    error.value = '관련 콘텐츠를 불러오지 못했습니다.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  if (scrollContainer.value) {
    scrollContainer.value.style.webkitOverflowScrolling = 'touch'
  }

  await fetchItems()
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
