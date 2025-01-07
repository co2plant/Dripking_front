<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :itemType="itemType"
          :target-id="targetId"
      />
      <Horizontal-scroll-card-list
          :title="'생산하는 술'"
          :toName="'alcoholDetail'"
          :urlStr="'api/alcohols'">
      </Horizontal-scroll-card-list>
    </div>
  </div>
</template>

<script setup>
import HorizontalScrollCardList from "@/components/HorizontalScrollCardList.vue";
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const targetId = route.params.id;
const itemType = 'ALCOHOL';
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>