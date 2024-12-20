<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
//import {useRoute} from "vue-router";

//const route = useRoute();
//const paramName = route.params.name.split('=')[1];
</script>

<template>
  <VerticalScrollCardList
      :title="'검색 내용'"
      :toName="''"
      :urlStr="'search/{{paramName}}'">
    >
  </VerticalScrollCardList>
</template>

<style scoped>
</style>