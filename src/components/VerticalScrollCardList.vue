<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">{{ props.title }}</h1>
    <div class="space-y-4">
      <div v-for="item in items" :key="item.id"
           class="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-lg">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg" :alt="item.name"
                 class="w-full h-32 md:h-40 object-cover"/>
          </div>
          <div class="md:w-3/4 p-4">
            <h2 class="text-xl font-semibold mb-2 text-gray-800">{{ item.name }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">{{ item.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ item.date }}</span>
              <router-link :to="{ name: props.toName, params: { id: item.id }}"
                           class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                자세히 보기
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center mt-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <div ref="infiniteScrollTrigger" class="h-1"></div>
  </div>
</template>

<script setup>
import {defineProps, ref, onMounted} from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  toName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true
  }
});

//let currentPage = 0;
let pageSize = 10;
const isLoading = ref(false);
const error = ref(null);
const infiniteScrollTrigger = ref(null);

const items = ref({});

const fetchItems = async (page = 0) => {
  isLoading.value = true
  error.value = null
  try {
    // 실제 API 호출로 대체해야 합니다
    const response = await fetch(`http://localhost:8080/api/${props.itemType}?page=${page}&size=${pageSize}`)
    if (!response.ok) {
      throw new Error('서버에서 리뷰를 가져오는데 실패했습니다.')
    }
    const data = await response.json()
    items.value = data.content
    //totalPages = data.totalPages
    //currentPage = data.pageable.pageNumber

  } catch (err) {
    console.error('리뷰를 불러오는 중 오류가 발생했습니다:', err)
    error.value = '리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  console.log('mounted')
  fetchItems()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Prevent text selection during dragging */
.select-none {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>