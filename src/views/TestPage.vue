<script setup>
import { ref, onMounted } from 'vue'
import { GoogleMap, Marker } from 'vue3-google-map'

const center = ref({ lat: 33.499, lng: 126.531 }) // 제주도 중심 좌표
const zoom = ref(10)
const activeDestination = ref(null)
const destinations = ref([])

// API에서 목적지 데이터를 가져오는 함수
const fetchDestinations = async () => {
  try {
    // API 엔드포인트를 실제 URL로 변경해야 합니다
    const response = await fetch('/api/destinations')
    const data = await response.json()
    destinations.value = data
  } catch (error) {
    console.error('목적지 데이터를 불러오는 데 실패했습니다:', error)
  }
}

const selectDestination = (destination) => {
  activeDestination.value = destination
  center.value = { lat: destination.latitude, lng: destination.longitude }
  zoom.value = 14
}

onMounted(() => {
  fetchDestinations()
})
</script>

<template>
  <div class="flex h-[600px] max-w-6xl mx-auto border border-gray-200 rounded-lg overflow-hidden">
    <div class="flex-grow">
      <GoogleMap
          api-key=""
          class="w-full h-full"
          :center="center"
          :zoom="zoom"
      >
        <Marker
            v-for="dest in destinations"
            :key="dest.id"
            :options="{ position: { lat: dest.latitude, lng: dest.longitude } }"
            @click="selectDestination(dest)"
        />
      </GoogleMap>
    </div>
    <div class="w-1/3 p-4 bg-gray-50 overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">목적지 목록</h2>
      <ul class="space-y-4">
        <li
            v-for="dest in destinations"
            :key="dest.id"
            @click="selectDestination(dest)"
            class="bg-white p-4 rounded-lg shadow cursor-pointer transition-colors hover:bg-gray-100"
            :class="{ 'border-l-4 border-blue-500': activeDestination === dest }"
        >
          <div class="flex items-start space-x-3">
            <img :src="dest.img_url" :alt="dest.name" class="w-20 h-20 object-cover rounded-md">
            <div>
              <h3 class="font-semibold text-lg text-blue-600">{{ dest.name }}</h3>
              <p class="text-sm text-gray-600">{{ dest.description }}</p>
              <span class="text-xs text-gray-500">{{ dest.itemType }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>