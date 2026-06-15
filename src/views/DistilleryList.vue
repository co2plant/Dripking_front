<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import ListLocationMap from "@/components/ListLocationMap.vue";
import WishListSideBar from "@/components/WishListSideBar.vue";

const handleViewDetails = (item) => {
  router.push({ name: 'distilleryDetail', params: { id: item.id } })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
      양조장 목록
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
    </h1>
    <ListLocationMap
        endpoint="distilleries/markers"
        itemType="DISTILLERY"
        detailRouteName="distilleryDetail"
    />
    <WishListSideBar />
    <VerticalScrollCardList
        itemType="DISTILLERY"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>
