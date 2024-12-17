<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
</script>

<template>
  <VerticalScrollCardList
    :title="'지역 정보 리스트'"
    :toName="'DestinationDetail'"
    :urlStr="'destinations'">
  >
  </VerticalScrollCardList>
</template>

<style scoped>
</style>