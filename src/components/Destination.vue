<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-12">
        <h1 class="text-4xl font-bold mb-6 text-gray-800">{{ destination.name }}</h1>
        <div class="relative h-96 mb-6">
          <img
              src="https://upload.wikimedia.org/wikipedia/commons/e/e5/ENIAC-changing_a_tube.jpg"
              :alt="destination.name"
              class="rounded-lg object-cover w-full h-full shadow-lg"
          />
        </div>
        <p class="text-xl mb-6 text-gray-600 leading-relaxed">{{ destination.description }}</p>
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">상세 내용</h2>
        <p class="text-gray-600 leading-relaxed">{{ destination.description }}</p>
      </div>

      <Horizontal-scroll-card-list
        :title="'주변 양조장'"
        :toName="'DistilleryDetail'"
        :urlStr="'api/distilleries'">
      </Horizontal-scroll-card-list>
    </div>
  </div>
</template>

<script setup>
  import {ref} from "vue";
  import axios from "axios";
  import HorizontalScrollCardList from "@/components/HorizontalScrollCardList.vue";
  import {useRoute} from "vue-router";

  const route = useRoute();

  const destination = ref({
    name: '',
    image: '',
    description: ''
  });

  const urlStr = 'http://localhost:8080/api/destination/' + route.params.id;

  axios.get(urlStr)
      .then(response => {
          destination.value = response.data;
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