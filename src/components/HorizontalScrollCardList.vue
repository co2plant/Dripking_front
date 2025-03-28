<template>
  <div
      v-if="items.length"
      class="mb-6">
    <h3 class="text-2xl font-semibold mb-6 text-gray-800">{{propsRef.title}}</h3>
    <div class="relative">
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
                :src="item.img_url"
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

const props = defineProps(['title', 'toName', 'urlStr']);
const propsRef = ref(props);
const items = ref([]);

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

onMounted(async () => {
  if (scrollContainer.value) {
    scrollContainer.value.style.webkitOverflowScrolling = 'touch'
  }

  try {
    const data = await apiService.get(props.urlStr);

    items.value = data.content;
  } catch (error) {
    console.error("API 호출 오류:", error);
  }
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