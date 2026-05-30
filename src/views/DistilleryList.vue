<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import {ref} from "vue";
import NearbyPositionFilter from "@/components/NearbyPositionFilter.vue";
import ListLocationMap from "@/components/ListLocationMap.vue";
import WishListSideBar from "@/components/WishListSideBar.vue";

const coordinateBounds = ref(null);

const handleViewDetails = (item) => {
  router.push({ name: 'distilleryDetail', params: { id: item.id } })
}
const updateCoordinateBounds = (bounds) => {
  coordinateBounds.value = bounds
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
    <NearbyPositionFilter
        @update-coordinate-bounds="updateCoordinateBounds"
    />
    <WishListSideBar />
    <VerticalScrollCardList
        itemType="DISTILLERY"
        :coordinateBounds="coordinateBounds"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>
