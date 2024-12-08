<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ location.name }}</h1>
        <div class="relative h-96 mb-6">
          <img
              :src="location.image"
              :alt="location.name"
              class="rounded-lg object-cover w-full h-full shadow-lg"
          />
        </div>
        <p class="text-xl mb-6 text-gray-600 leading-relaxed">{{ location.description }}</p>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">상세 내용</h2>
        <p class="text-gray-600 leading-relaxed">{{ location.details }}</p>
      </div>

      <div>
        <h2 class="text-3xl font-semibold mb-6 text-gray-800">주변 관광지</h2>
        <div class="relative">
          <div
              class="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide scroll-smooth"
              @touchstart="touchStart"
              @touchmove="touchMove"
              @touchend="touchEnd"
              ref="scrollContainer"
          >
            <router-link
                v-for="attraction in displayedAttractions"
                :key="attraction.id"
                :to="{ name: 'AttractionDetail', params: { id: attraction.id }}"
                class="flex-shrink-0 w-72 bg-white rounded-lg overflow-hidden shadow-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            >
              <div class="relative h-48">
                <img
                    :src="attraction.image"
                    :alt="attraction.name"
                    class="w-full h-full object-cover"
                />
              </div>
              <div class="p-6">
                <h3 class="font-bold text-xl mb-2 text-gray-800">{{ attraction.name }}</h3>
                <p class="text-gray-600">{{ attraction.description }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
  import { computed, onMounted } from 'vue'

  const location = ref({
    name: "서울 (Seoul)",
    description: "서울은 대한민국의 수도이자 최대 도시입니다. 현대적인 고층 빌딩과 고궁, 불교 사찰이 공존하는 독특한 도시입니다.",
    details: "서울은 600년 이상의 역사를 자랑하며, 조선왕조의 수도였습니다. 오늘날 서울은 세계적인 기술 혁신의 중심지이자 K-pop과 한류의 발상지로 알려져 있습니다. 고궁, 현대적인 쇼핑몰, 한강 공원 등 다양한 명소가 있어 관광객들에게 인기가 높습니다.",
    image: "/placeholder.svg?height=400&width=800"
  })

  const nearbyAttractions = ref(Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `관광지 ${i + 1}`,
    description: `서울의 아름다운 관광지 ${i + 1}번째 입니다. 이곳에서 서울의 매력을 느껴보세요.`,
    image: `/placeholder.svg?height=200&width=300&text=Attraction${i + 1}`
  })))

  const displayedAttractions = computed(() => nearbyAttractions.value.slice(0, 100))

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
</script>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'Destination',
  setup() {
    const destination = ref([]);

    axios.get('http://localhost:8080/api/destination')
        .then(response => {
          destination.value = response.data;
        })
        .catch(error => {
          if(error.response){
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.header);
          }
          console.error('Error fetching distilleries:', error);
        });

    return {
      destination
    };
  }
};
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