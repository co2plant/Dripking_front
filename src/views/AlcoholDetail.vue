<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :target-id="targetId"
          :item-type="itemType"
      >
      </Card>
      <VerticalReviewList
          :target-id="targetId"
          :item-type="itemType">
      </VerticalReviewList>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";
import VerticalReviewList from "@/components/VerticalReviewList.vue";

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
