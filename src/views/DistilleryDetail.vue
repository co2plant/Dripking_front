<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :item-type="itemType"
          :target-id="targetId"
      />
      <DetailLocationMap
          :target-id="targetId"
          :item-type="itemType"
      />
      <Horizontal-scroll-card-list
          :title="'생산하는 술'"
          :toName="'alcoholDetail'"
          :urlStr="'alcohols?distilleryId='+targetId">
      </Horizontal-scroll-card-list>
      <VerticalReviewList
          :target-id="targetId"
          :item-type="itemType">
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
const targetId = route.params.id;
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
