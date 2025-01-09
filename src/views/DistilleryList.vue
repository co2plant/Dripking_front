<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
const handleViewDetails = (item) => {
  router.push({ name: 'distilleryDetail', params: { id: item.id } })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">양조장 목록</h1>
    <VerticalScrollCardList
        fetch-url="/api/distilleries"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>