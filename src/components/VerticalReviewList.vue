<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">리뷰</h1>
    <div v-if="isLoggedIn">
      <div ref="reviewFormSection">
        <ReviewForm
            :target-id="targetId"
            :item-type="itemType"
            :review-to-edit="currentUserReview"
            @reviewSubmitted="handleReviewSubmitted"
        />
      </div>
    </div>
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-600">리뷰를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-600">{{ error }}</p>
    </div>
    <div v-if="feedbackMessage" class="text-center py-2">
      <p class="text-sm" :class="feedbackError ? 'text-red-600' : 'text-green-700'">{{ feedbackMessage }}</p>
    </div>
    <div v-if="!isLoading && !error" class="flex flex-col items-center w-full">
      <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          :canEdit="isOwnReview(review)"
          :canDelete="isOwnReview(review)"
          :canReport="isLoggedIn && !isOwnReview(review)"
          @editReview="editReview"
          @deleteReview="deleteReview"
          @reportReview="reportReview"
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
  targetId: {
    type: String,
    required: true
  },
  itemType: {
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
const feedbackMessage = ref('')
const feedbackError = ref(false)
const currentUserReview = ref(null)
const reviewFormSection = ref(null)
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isSignedIn || authStore.isAuthenticated())
const currentUserId = computed(() => authStore.userId)

const isOwnReview = (review) => {
  return isLoggedIn.value
      && review?.userId != null
      && currentUserId.value != null
      && String(review.userId) === String(currentUserId.value)
}

const setFeedback = (message, isError = false) => {
  feedbackMessage.value = message
  feedbackError.value = isError
}

const clearFeedback = () => {
  setFeedback('')
}

const fetchReviews = async (page = 0) => {
  isLoading.value = true
  error.value = null
  try {
    const response = await apiService.get(`reviews?itemType=${props.itemType}&targetId=${props.targetId}&page=${page}&size=${pageSize}`)
    if (!response) {
      throw new Error('서버에서 리뷰를 가져오는데 실패했습니다.')
    }
    reviews.value = response.content
    totalPages.value = response.totalPages
    currentPage.value = response.pageable.pageNumber
    await fetchCurrentUserReview()
  } catch (err) {
    console.error('리뷰를 불러오는 중 오류가 발생했습니다:', err)
    error.value = '리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

const fetchCurrentUserReview = async () => {
  if (!isLoggedIn.value) {
    currentUserReview.value = null
    return
  }

  try {
    currentUserReview.value = await apiService.getWithToken(`reviews/my?itemType=${props.itemType}&targetId=${props.targetId}`)
  } catch (err) {
    console.error('내 리뷰를 불러오는 중 오류가 발생했습니다:', err)
    currentUserReview.value = null
  }
}

const editReview = (reviewId) => {
  const review = reviews.value.find((item) => item.id === reviewId)
  if (review && isOwnReview(review)) {
    currentUserReview.value = review
  }
  clearFeedback()
  reviewFormSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const deleteReview = async (reviewId) => {
  if (!isLoggedIn.value) {
    setFeedback('리뷰를 삭제하려면 로그인이 필요합니다.', true)
    return
  }

  const review = reviews.value.find((item) => item.id === reviewId)
  if (!review || !isOwnReview(review)) {
    setFeedback('이 리뷰를 삭제할 권한이 없습니다.', true)
    return
  }

  if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) {
    return
  }

  clearFeedback()
  try {
    await apiService.deleteWithToken(`reviews/${reviewId}`)
    currentUserReview.value = null
    setFeedback('리뷰가 삭제되었습니다.')
    const nextPage = reviews.value.length === 1 && currentPage.value > 0
        ? currentPage.value - 1
        : currentPage.value
    await fetchReviews(nextPage)
  } catch (err) {
    console.error('리뷰 삭제 중 오류가 발생했습니다:', err)
    setFeedback('리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.', true)
  }
}

const reportReview = async (reviewId) => {
  if (!isLoggedIn.value) {
    setFeedback('리뷰를 신고하려면 로그인이 필요합니다.', true)
    return
  }

  clearFeedback()
  try {
    await apiService.postWithToken(`reviews/${reviewId}/reports`, {})
    setFeedback('리뷰 신고가 접수되었습니다.')
  } catch (err) {
    console.error('리뷰 신고 중 오류가 발생했습니다:', err)
    setFeedback('리뷰 신고에 실패했습니다. 잠시 후 다시 시도해주세요.', true)
  }
}

const handleReviewSubmitted = async () => {
  clearFeedback()
  await fetchReviews()
}

onMounted(async () => {
  await authStore.initAuth()
  fetchReviews()
})
</script>
