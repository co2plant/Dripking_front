<template>
  <div>
    <ReviewCard v-for="review in reviews.content" :key="review.id" :review="review"/>
    <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @pageChanged="$emit('pageChanged', $event)"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import ReviewCard from './ReviewCard.vue'
import Pagination from "@/components/Pagination.vue";

defineProps({
  reviews: {
    type: Object,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

defineEmits(['pageChanged'])
</script>