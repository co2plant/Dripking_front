<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :target-id="targetId"
          :item-type="itemType"
      />
      <DetailLocationMap
          :target-id="targetId"
          :item-type="itemType"
      />
      <Horizontal-scroll-card-list
          :title="'주변 양조장'"
          :toName="'distilleryDetail'"
          :urlStr="'distilleries?destinationId='+targetId">
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
const itemType = 'DESTINATION';
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
