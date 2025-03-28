<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import CategoryNavigation from "@/components/CategoryNavigation.vue";
import router from "@/router";
import {onMounted, ref} from "vue";
import WishListSideBar from "@/components/WishListSideBar.vue";
import {apiService} from "@/services/api";

const categories = ref([]);
const selectedCategory = ref(0)

const handleViewDetails = (item) => {
  router.push({name: 'alcoholDetail', params: {id: item.id}})
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

onMounted(async () => {
  try{
    let data = await apiService.get(categories).content;
    categories.value = data.content;
  } catch (error) {
    console.error("API 호출 오류:", error);
  }
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
    <WishListSideBar />
    <VerticalScrollCardList
        itemType="ALCOHOL"
        :selectedItem="selectedCategory"
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