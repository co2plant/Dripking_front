<template>
  <div class="bg-white shadow-md rounded-lg p-6 mb-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="text-lg font-semibold mr-2">{{ props.review.nickname }}</div>
        <div class="text-yellow-400">
          <span v-for="i in 5" :key="i">
            <i :class="i <= props.review.rating ? 'fas fa-star' : 'far fa-star'"></i>
          </span>
        </div>
      </div>
      <div class="text-sm text-gray-500">
        {{ formatDate(props.review.createdAt) }}
<!--        <span v-if="props.review.updatedAt && props.review.modifiedAt !== props.review.createdAt">-->
<!--          (수정됨: {{ formatDate(props.review.modifiedAt) }})-->
<!--        </span>-->
      </div>
    </div>
    <p class="text-gray-700">{{ props.review.contents }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})

console.log(props);

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('ko-KR', options)
}
</script>
