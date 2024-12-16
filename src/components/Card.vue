<template>
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ item.name }}</h1>
    <div class="relative h-96 mb-6">
      <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg"
          :alt="item.name"
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
import {useRoute} from "vue-router";

const route = useRoute();

const props = defineProps(['title', 'urlStr']);

const item = ref({
  name: '',
  image: '',
  description: ''
});

const urlStr = 'http://localhost:8080/api/destination/' + route.params.id;

axios.get(urlStr)
    .then(response => {
      item.value = response.data;
    })
    .catch(
        error => {
          console.error('Error fetching destination get function:', error);
        }
    )
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