<template>
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ item.name }}</h1>
    <div class="relative h-96 mb-6">
      <img
          :src=item.img_url
          :alt=item.name
          class="rounded-lg object-cover w-full h-full shadow-lg"
      />
    </div>
    <p class="text-xl mb-6 text-gray-600 leading-relaxed">{{ item.description }}</p>
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">상세 내용</h2>
    <p class="text-gray-600 leading-relaxed">{{ item.description }}</p>
  </div>
</template>

<script setup>
import {defineProps, ref} from "vue";
import axios from "axios";

const ItemTypes = {
  DESTINATION: 'destinations',
  ALCOHOL: 'alcohols',
  DISTILLERY: 'distilleries'
}

const props = defineProps(['itemType', 'targetId']);

const item = ref([]);

const urlStr = 'http://localhost:8080/api/' + ItemTypes[props.itemType] + '/' + props.targetId;
axios.get(urlStr)
    .then(response => {
      item.value = response.data;
    })
    .catch(
        error => {
          console.error('Error fetching destination get function:', error);
        }
    )

console.log(item);
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