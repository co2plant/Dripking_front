<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :itemType="itemType"
          :target_id="target_id"
      />
      <DetailLocationMap
          :target_id="target_id"
          :itemType="itemType"
      />
      <Horizontal-scroll-card-list
          :title="'생산하는 술'"
          :toName="'alcoholDetail'"
          :urlStr="'alcohols?distilleryId='+target_id">
      </Horizontal-scroll-card-list>
      <VerticalReviewList
          :target_id="target_id"
          :reviewType="itemType">
      </VerticalReviewList>
    </div>
  </div>
</template>

<script setup>
import HorizontalScrollCardList from "@/components/HorizontalScrollCardList.vue";
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";
import VerticalReviewList from "@/components/VerticalReviewList.vue";
import DetailLocationMap from "@/components/DetailLocationMap.vue";

const route = useRoute();
const target_id = route.params.id;
const itemType = 'DISTILLERY';
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
