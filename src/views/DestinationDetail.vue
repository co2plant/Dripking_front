<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card :targetId="targetId" :itemType="itemType"/>
      <Horizontal-scroll-card-list
          :title="'주변 양조장'"
          :toName="'distilleryDetail'"
          :urlStr="'api/distilleries'">
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