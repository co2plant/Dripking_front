<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">리뷰</h1>
    <VerticalReviewList
      :reviews="paginatedReviews"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @pageChanged="fetchReviews"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VerticalReviewList from '../components/VerticalReviewList.vue'

const reviews = ref([])
const currentPage = ref(1)
const totalReviews = ref(0)
const pageSize = 10

const fetchReviews = async (page = 1) => {
  try {
    // 실제 API 호출로 대체해야 합니다
    const response = await fetch(`http://localhost:8080/api/reviews?page=${page}&pageSize=${pageSize}&reviewType=alcohol&target_id=1`)
    const data = await response.json()
    reviews.value = data.content
    totalReviews.value = data.totalPages
    currentPage.value = page
    console.log(reviews.value)
  } catch (error) {
    console.error('리뷰를 불러오는 중 오류가 발생했습니다:', error)
  }
}

const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize))

const paginatedReviews = computed(() => {
  //const start = (currentPage.value - 1) * pageSize
  //const end = start + pageSize
  return reviews
})

onMounted(() => {
  fetchReviews()
})
</script>