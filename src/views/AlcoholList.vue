<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import {onMounted, ref} from "vue";
import WishListSideBar from "@/components/WishListSideBar.vue";
import {apiService} from "@/services/api";
import ChipFilterBar from "@/components/ChipFilterBar.vue";

const categories = ref([]);
const selectedCategory = ref(0)

const handleViewDetails = (item) => {
  router.push({name: 'alcoholDetail', params: {id: item.id}})
}

const selectCategory = (categoryId) => {
  selectedCategory.value = Number(categoryId) || 0
}

onMounted(async () => {
  try{
    categories.value = await apiService.get('categories');
  } catch (error) {
    console.error("API 호출 오류:", error);
  }
})
</script>

<template>
  <div class="py-8">
    <div class="mx-auto max-w-5xl px-4">
      <h1 class="mb-8 text-3xl font-bold text-zinc-900">
        <span class="inline-block h-1 w-20 bg-amber-400"></span>
        주류 목록
        <span class="inline-block h-1 w-20 bg-amber-400"></span>
      </h1>
      <ChipFilterBar
          v-model:selected-value="selectedCategory"
          label="카테고리"
          :items="categories"
          @select="selectCategory"
      />
    </div>
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
