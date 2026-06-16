<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :target-id="targetId"
          :item-type="itemType"
      >
      </Card>
      <div class="mb-8 flex justify-end">
        <router-link
            :to="{ name: 'tastingNotes', query: { alcoholId: targetId } }"
            class="inline-flex items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          테이스팅 노트 작성
        </router-link>
      </div>
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
