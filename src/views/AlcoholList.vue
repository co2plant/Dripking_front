<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import CategoryNavigation from "@/components/CategoryNavigation.vue";
import router from "@/router";
import {onMounted, ref} from "vue";

const categories = ref([]);
const selectedCategory = ref(0)

const handleViewDetails = (item) => {
  router.push({name: 'alcoholDetail', params: {id: item.id}})
}

const fetchItems = async () => {
  const response = await fetch('http://localhost:8080/api/categories');
  return await response.json();
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

onMounted(async () => {
  categories.value = await fetchItems();
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
      주류 목록
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
    </h1>
    <CategoryNavigation
        :categories="categories"
        :selectedCategory="selectedCategory"
        @select-category="selectCategory"
    />
    <VerticalScrollCardList
        itemType="ALCOHOL"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>