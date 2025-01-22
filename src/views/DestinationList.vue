<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import DateContrySelection from "@/components/DateContrySelection.vue";
const handleViewDetails = (item) => {
  router.push({ name: 'destinationDetail', params: { id: item.id } })
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
      목적지 목록
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
    </h1>
    <DateContrySelection>
    </DateContrySelection>
    <VerticalScrollCardList
        itemType="DESTINATION"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>