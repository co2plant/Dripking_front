<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ distillery.name }}</h1>
        <div class="relative h-96 mb-6">
          <img
              src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg"
              :alt="distillery.name"
              class="rounded-lg object-cover w-full h-full shadow-lg"
          />
        </div>
        <p class="text-xl mb-6 text-gray-600 leading-relaxed">{{distillery.description }}</p>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">상세 내용</h2>
        <p class="text-gray-600 leading-relaxed">{{ distillery.description }}</p>
      </div>

      <div>
        <h2 class="text-3xl font-semibold mb-6 text-gray-800">제작되는 술들</h2>
        <div class="relative">
          <div
              class="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide scroll-smooth"
              @touchstart="touchStart"
              @touchmove="touchMove"
              @touchend="touchEnd"
              ref="scrollContainer"
          >
            <router-link
                v-for="alcohol in alcohols"
                :key="alcohol.id"
                :to="{params: { id: alcohol.id }}"
                class="flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              <div class="relative h-48">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Common_alcoholic_beverages.jpg"
                    :alt="alcohol.name"
                    class="w-full h-full object-cover"
                />
              </div>
              <div class="p-6">
                <h3 class="font-bold text-xl mb-2 text-gray-800">{{ alcohol.name }}</h3>
                <p class="text-gray-600">{{ alcohol.description }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import {useRoute} from "vue-router";

const route = useRoute();
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

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.style.webkitOverflowScrolling = 'touch'
  }
})

const distillery = ref({
  name: '',
  image: '',
  description: ''
});
const alcohols = ref([])

const urlStr = 'http://localhost:8080/api/distillery/' + route.params.id;

axios.get(urlStr)
    .then(response => {
      distillery.value = response.data;
    })
    .catch(
        error => {
          console.error('Error fetching destination get function:', error);
        }
    )

axios.get('http://localhost:8080/api/alcohols')
    .then(response => {
      alcohols.value = response.data;
    })
    .catch(
        error =>{
          console.error('Error fetching distilleries get function :', error);
        }
    )
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