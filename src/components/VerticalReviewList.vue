<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">리뷰</h1>
    <div v-if="isLoggedIn">
      <ReviewForm
          :targetId="targetId"
          :reviewType="reviewType"
          @reviewSubmitted="fetchReviews"
      />
    </div>
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-600">리뷰를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-600">{{ error }}</p>
    </div>
    <div v-else class="flex flex-col items-center w-full max-w-3xl mx-auto">
      <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :canEdit="review.userId === currentUserId"
          @editReview="editReview"
      />
      <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @pageChanged="fetchReviews"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue'
import ReviewCard from './ReviewCard.vue'
import Pagination from './Pagination.vue'
import ReviewForm from './ReviewForm.vue'

const props = defineProps({
  targetId: {
    type: String,
    required: true
  },
  reviewType: {
    type: String,
    required: true
  }
})

const reviews = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 5
const isLoading = ref(false)
const error = ref(null)
const isLoggedIn = ref(false) // 실제 로그인 상태를 확인하는 로직으로 대체해야 합니다
const currentUserId = ref(null) // 현재 로그인한 사용자의 ID

const fetchReviews = async (page = 0) => {
  isLoading.value = true
  error.value = null
  try {
    const response = await fetch(`http://localhost:8080/api/reviews?reviewType=${props.reviewType}&target_id=${props.targetId}&page=${page}&size=${pageSize}`)
    if (!response.ok) {
      throw new Error('서버에서 리뷰를 가져오는데 실패했습니다.')
    }
    const data = await response.json()
    reviews.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.pageable.pageNumber
  } catch (err) {
    console.error('리뷰를 불러오는 중 오류가 발생했습니다:', err)
    error.value = '리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

const editReview = (reviewId) => {
  // 리뷰 수정 로직 구현
  console.log('Edit review:', reviewId)
}

onMounted(() => {
  fetchReviews()
  // 로그인 상태 확인 및 현재 사용자 ID 가져오기
  // 이 부분은 실제 인증 시스템에 맞게 구현해야 합니다
  isLoggedIn.value = true // 예시: 항상 로그인 상태
  currentUserId.value = '123' // 예시: 임의의 사용자 ID
})
</script>