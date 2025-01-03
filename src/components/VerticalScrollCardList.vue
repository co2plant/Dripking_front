<script setup>
  import {defineProps, onMounted, onUnmounted, ref} from 'vue';
  import axios from 'axios';
  import Pagenation from "@/components/Pagination.vue";

  const loading = ref(false)
  const infiniteScrollTrigger = ref(null)

  const props = defineProps(['title', 'toName', 'urlStr']);
  const propsRef = ref(props);

  const items = ref([]);
  const pages = ref([]);

  const fetchLocations = async () => {
    if (loading.value) return
    loading.value = true


  const urlStr = 'http://localhost:8080/api/' + props.urlStr;

  axios.get(urlStr)
      .then(response => {
        items.value = response.data.content;
        pages.value = response.data.pageable;
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.header);
        }
        console.error('Error fetching distilleries:', error);
      });
  }

  const handleIntersect = (entries) => {
    if (entries[0].isIntersecting) {
      fetchLocations()
    }
  }

  onMounted(() => {
    fetchLocations()

  const observer = new IntersectionObserver(handleIntersect, {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  })

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value)
  }

  onUnmounted(() => {
    if (infiniteScrollTrigger.value) {
      observer.unobserve(infiniteScrollTrigger.value)
    }
  })
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">{{propsRef.title}}</h1>
    <div class="space-y-4">
      <div v-for="item in items" :key="item.id" class="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-lg">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg" :alt="item.name" class="w-full h-32 md:h-40 object-cover" />
          </div>
          <div class="md:w-3/4 p-4">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ item.name }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ item.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ item.date }}</span>
              <router-link :to="{ name: toName, params: { id: item.id }}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                자세히 보기
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <pagenation :total-pages="pages.pageSize" :current-page="pages.pageNumber">
    </pagenation>
    <div v-if="loading" class="flex justify-center items-center mt-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div ref="infiniteScrollTrigger" class="h-1"></div>
  </div>
</template>