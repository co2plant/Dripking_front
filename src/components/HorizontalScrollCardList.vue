<script setup>
  //const urlStr = 'http://localhost:8080/api/distilleries' + route.params.id; 해당지역의 양조장들을 정리해서 보여줘야하므로 지역코드에 따른 분류 필요
  import axios from "axios";
  import {defineProps, onMounted, ref} from "vue";

  const props = defineProps(['title', 'toName', 'urlStr']);
  /*
  title :
  toName : (default : null)
  urlStr :
  * */

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

  const items = ref([])
  const urlStr = 'http://localhost:8080/'+props.urlStr;

  axios.get(urlStr)
    .then(response => {
      items.value = response.data;
    })
    .catch(
        error =>{
          console.error('Error fetching distilleries get function :', error);
        }
    )

</script>

<template>
  <div>
    <h2 class="text-3xl font-semibold mb-6 text-gray-800">주변 양조장</h2>
    <div class="relative">
      <div
          class="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide scroll-smooth"
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
          <div class="relative h-48">
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg"
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