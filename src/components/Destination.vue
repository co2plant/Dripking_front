<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :toName = "'DestinationDetail'"
          :urlStr ="urlStr"
      >
      </Card>

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
  const urlStr = 'destination/'+route.params.id;
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