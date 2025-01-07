<template>
  <div class="bg-white rounded-lg p-6 mb-4 shadow-sm w-full flex flex-col">
    <!-- 상단 프로필 영역 -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center">
        <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 mr-3">
          <img
              :src="'https://upload.wikimedia.org/wikipedia/commons/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg' || '/placeholder.svg?height=48&width=48'"
              :alt="review.author"
              class="w-full h-full object-cover"
          />
        </div>
        <div class="min-w-0 flex flex-col">
          <h3 class="text-base font-semibold text-gray-900 truncate text-left">{{ review.nickname }}</h3>
          <div class="flex items-center text-xs text-gray-600 justify-start">
            <span class="truncate">{{ review.location }}</span>
            <span class="mx-1">•</span>
            <span class="whitespace-nowrap">{{ review.contributions }} contributions</span>
          </div>
        </div>
      </div>
      <div class="flex items-center flex-shrink-0">
        <button class="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-full px-3 py-1 transition-colors duration-200">
          <ThumbsUp class="w-5 h-5 mr-1" />
          <span class="text-sm font-medium">{{ review.likes }}</span>
        </button>
      </div>
    </div>

    <!-- 리뷰 컨텐츠 영역 -->
    <div class="flex-1">
      <div class="flex items-center mb-2">
        <div class="flex mr-2">
          <template v-for="i in 5" :key="i">
            <svg class="w-5 h-5" :class="i <= Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </template>
        </div>
        <span class="text-sm font-medium text-gray-600">{{ review.rating }}</span>
      </div>

      <!-- 제목과 방문 정보 -->
<!--      <h4 class="text-lg font-bold text-gray-900 mb-1 truncate">{{ review.title }}</h4>-->
<!--      <div class="flex items-center text-xs text-gray-600 mb-2">-->
<!--        <span>{{ formatDate(review.createdTime) }}</span>-->
<!--        <span class="mx-1">•</span>-->
<!--        <span>{{ formatDate(review.createdTime) }}</span>-->
<!--      </div>-->

      <!-- 리뷰 내용 -->
      <div class="text-sm text-gray-700">
        <p v-if="!isExpanded" class="line-clamp-3">{{ getContent(review.contents) }}</p>
        <p v-else>{{ getContent(review.contents) }}</p>
        <button
            v-if="getContent(review.contents).length > 150"
            @click="toggleExpand"
            class="text-blue-600 hover:text-blue-800 font-medium mt-2"
        >
          {{ isExpanded ? '접기' : '더 보기' }}
        </button>
      </div>
    </div>

    <!-- 하단 작성일 정보 -->
    <div class="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-100">

      <span>
        {{ formatDate(review.modifiedTime) }}
      </span>
      <span v-if="review.modifiedTime && review.modifiedTime !== review.createdTime">
        (수정됨)
      </span>
    </div>
  </div>
</template>

<script setup>
import {defineProps, ref} from 'vue'
import { ThumbsUp } from 'lucide-vue-next'

defineProps({
  review: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
          typeof value.author === 'string' &&
          typeof value.rating === 'number' &&
          value.rating >= 0 &&
          value.rating <= 5 &&
          value.createdAt instanceof Date
      )
    }
  }
})

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  if (!date) return ''

  // For written date, show full date
  return new Date(date).toLocaleDateString('ko-KR', options)
}

const getContent = (content) => {
  if (typeof content === 'string') {
    return content;
  }
  if (content === undefined || content === null) {
    return '내용이 없습니다.';
  }
  return String(content);
}
</script>

<style scoped>
.bg-yellow-400 {
  background-color: #FBBF24;
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.1);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
