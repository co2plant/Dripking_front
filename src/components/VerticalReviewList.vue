<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">리뷰</h1>
    <div v-if="isLoading" class="text-center py-4">
      <p class="text-gray-600">리뷰를 불러오는 중...</p>
    </div>
    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-600">{{ error }}</p>
    </div>
    <template v-else>
      <ReviewList
          :reviews="reviews"
          :currentPage="currentPage"
          :totalPages="totalPages"
          @pageChanged="fetchReviews"
      />
    </template>
    <ReviewCard v-for="review in reviews" :key="review.id" :review="review"/>
    <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @pageChanged="$emit('pageChanged', $event)"
    />
  </div>
</template>

<script setup>
import {defineProps, defineEmits, ref} from 'vue'
import ReviewCard from './ReviewCard.vue'
import Pagination from './Pagination.vue'

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

const reviews = ref({
  content: [],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: false,
  totalElements: 0,
  totalPages: 0,
  first: true,
  size: 10,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  numberOfElements: 0,
  empty: true
});

const currentPage = 1
const totalPages = 0
const pageSize = 5
const totalElements = ref(0)
const isLoading = ref(false)
const error = ref(null)

const fetchReviews = async (page = 1) => {
  isLoading.value = true
  error.value = null
  try {
    // 실제 API 호출로 대체해야 합니다
    const response = await fetch(`http://localhost:8080/api/reviews?reviewType=${props.reviewType}&target_id=${props.targetId}&page=${page}&size=${pageSize}`)

    if (!response.ok) {
      throw new Error('서버에서 리뷰를 가져오는데 실패했습니다.')
    }
    const data = await response.json()
    console.log(data)
    reviews.value = data.content.map(review => ({
      ...review,
      createdAt: new Date(review.createdAt),
      updatedAt: review.updatedAt ? new Date(review.updatedAt) : null
    }))

    currentPage.value = data.pageable.pageNumber
    totalElements.value = data.totalElements

  } catch (err) {
    console.error('리뷰를 불러오는 중 오류가 발생했습니다:', err)
    error.value = '리뷰를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}



defineEmits(['pageChanged'])
</script>