<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">리뷰</h1>
    <div v-if="isLoggedIn">
      <ReviewForm
          :target_id="target_id"
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
    <div v-else class="flex flex-col items-center w-full">
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
import { computed, ref, onMounted, defineProps } from 'vue'
import ReviewCard from './ReviewCard.vue'
import Pagination from './Pagination.vue'
import ReviewForm from './ReviewForm.vue'
import {apiService} from "@/services/api";
import {useAuthStore} from "@/stores/useAuthStore";

const props = defineProps({
  target_id: {
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
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isSignedIn || authStore.isAuthenticated())
const currentUserId = computed(() => authStore.userId)

const fetchReviews = async (page = 0) => {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiService.get(`reviews?itemType=${props.reviewType}&targetId=${props.target_id}&page=${page}&size=${pageSize}`)
    if (!response) {
      throw new Error('서버에서 리뷰를 가져오는데 실패했습니다.')
    }
    reviews.value = response.content
    totalPages.value = response.totalPages
    currentPage.value = response.pageable.pageNumber
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

onMounted(async () => {
  await authStore.initAuth()
  fetchReviews()
})
</script>
