<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :target_id="target_id"
          :itemType="itemType"
      />
      <Horizontal-scroll-card-list
          :title="'주변 양조장'"
          :toName="'distilleryDetail'"
          :urlStr="'distilleries/destination?destination='+target_id">
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

const route = useRoute();
const target_id = route.params.id;
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