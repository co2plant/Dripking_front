<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :toName = "'AlcoholDetail'"
          :urlStr ="urlStr"
      >
      </Card>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const urlStr = 'alcohol/'+route.params.id;
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