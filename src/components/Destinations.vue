<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">지역 정보 리스트</h1>
    <div class="space-y-4">
      <div v-for="destination in destinations" :key="destination.id" class="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-lg">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg" :alt="destination.name" class="w-full h-32 md:h-40 object-cover" />
          </div>
          <div class="md:w-3/4 p-4">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ destination.name }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ destination.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ destination.date }}</span>
              <router-link :to="{ name: 'DestinationDetail', params: { id: destination.id }}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                자세히 보기
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="flex justify-center items-center mt-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div ref="infiniteScrollTrigger" class="h-1"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from "axios";

const destinations = ref([])
const loading = ref(false)
const infiniteScrollTrigger = ref(null)

const fetchLocations = async () => {
  if (loading.value) return
  loading.value = true

  try {
    axios.get('http://localhost:8080/api/destinations')
      .then(response => {
        destinations.value = response.data;
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.data)
          console.log(error.response.status)
          console.log(error.response.header)
        }
        console.error('Error fetching locations:', error)
      })
  } catch (error) {
    console.error('데이터를 불러오는 중 오류가 발생했습니다:', error)
  } finally {
    loading.value = false
  }
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

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>