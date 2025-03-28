<template>
  <div class="mb-12">
    <div class="relative h-96 mb-6">
      <img
          :src=item.img_url
          :alt=item.name
          class="rounded-lg object-cover w-full h-full shadow-lg"
      />
    </div>
    <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ item.name }}</h1>
    <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>
  </div>
</template>

<script setup>
import {defineProps, onMounted, ref} from "vue";
import { apiService } from "@/services/api";

const ItemTypes = {
  DESTINATION: 'destinations',
  ALCOHOL: 'alcohols',
  DISTILLERY: 'distilleries'
}

const props = defineProps(['itemType', 'target_id']);

const item = ref([]);

onMounted(() => {
  (async function() {
    item.value = await apiService.get(ItemTypes[props.itemType] + '/' + props.target_id);
  })();
})
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