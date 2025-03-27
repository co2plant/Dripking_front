<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :target_id="target_id"
          :itemType="itemType"
      >
      </Card>
      <VerticalReviewList
          :target_id="target_id"
          :reviewType="itemType">
      </VerticalReviewList>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";
import VerticalReviewList from "@/components/VerticalReviewList.vue";

const route = useRoute();
const target_id = route.params.id;
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