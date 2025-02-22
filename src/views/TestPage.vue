<script setup>
import { ref, onMounted } from 'vue'
import { GoogleMap, Marker } from 'vue3-google-map'

//제주 선택시 우상단 끝 33.560472, 126.881906
//좌하단 끝 33.202208, 126.209170
const center = ref({ lat: 34.9023747484815, lng: 135.68551060039104 })
const zoom = ref(10)
const activeDestination = ref(null)
const places = ref([])

// destination(city)에서 lat, lng를 받아 표시

// API에서 목적지 데이터를 가져오는 함수
const fetchDestinations = async () => {
  try {
    // API 엔드포인트를 실제 URL로 변경해야 합니다
    const response = await fetch('http://localhost:8080/api/distilleries/latlng?minLatitude=34&maxLatitude=35&minLongitude=135&maxLongitude=136')
    const data = await response.json()
    places.value = data.content
    console.log(places.value)
  } catch (error) {
    console.error('목적지 데이터를 불러오는 데 실패했습니다:', error)
  }
}

const selectDestination = (place) => {
  activeDestination.value = place
  center.value = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) }
  zoom.value = 14
}

onMounted(() => {
  fetchDestinations()
})
</script>

<template>
  <div class="flex h-[600px] max-w-6xl mx-auto border border-zinc-200 rounded-lg overflow-hidden">
    <div class="flex-grow">
      <GoogleMap
          api-key=""
          class="w-full h-full"
          :center="center"
          :zoom="zoom"
      >
        <Marker
            v-for="place in places"
            :key="place.id"
            :options="{ position: { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) } }"
            @click="selectDestination(place)"
        />
      </GoogleMap>
    </div>
    <div class="w-1/3 p-4 bg-zinc-50 overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4 text-amber-400">목적지 목록</h2>
      <ul class="space-y-4">
        <li
            v-for="place in places"
            :key="place.id"
            @click="selectDestination(place)"
            class="bg-white p-4 rounded-lg shadow cursor-pointer transition-colors hover:bg-zinc-100"
            :class="{ 'border-l-4 border-amber-500': activeDestination == place }"
        >
          <div class="flex items-start space-x-3">
            <img :src="place.img_url" :alt="place.name" class="w-20 h-20 object-cover rounded-md">
            <div>
              <h3 class="font-semibold text-lg text-zinc-900 line-clamp-2">{{ place.name }}</h3>
              <p class="text-sm text-zinc-600 line-clamp-2">{{ place.description }}</p>
              <span class="text-xs text-zinc-500 line-clamp-2">{{ place.itemType }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>