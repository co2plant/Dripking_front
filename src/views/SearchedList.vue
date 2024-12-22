<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const toNameStr = route.params.dtype + "Detail";
const urlStr = route.params.dtype + "/search/" + route.query.searchKeyword;
</script>

<template>
  <VerticalScrollCardList
      :title="'검색 내용'"
      :toName=toNameStr
      :urlStr=urlStr>
    >
  </VerticalScrollCardList>
</template>

<style scoped>
</style>