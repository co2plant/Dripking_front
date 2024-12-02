<template>
  <div class="bg-white">
    <div class="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900">Distilleries</h2>

      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        <div v-for="distillery in distilleries" :key="distillery.id" class="group relative">
          <img :src="distillery.imageSrc" :alt="distillery.imageAlt" class="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80" />
          <div class="mt-4 flex justify-between">
            <div>
              <h3 class="text-sm text-gray-700">
                <a :href="distillery.href">
                  <span aria-hidden="true" class="absolute inset-0" />
                  {{ distillery.name }}
                </a>
              </h3>
              <p class="mt-1 text-sm text-gray-500">{{ distillery.location }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">{{ distillery.price }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'LocationLists',
  setup() {
    const distilleries = ref([]);

    axios.get('http://localhost:8080/api/distilleries')
        .then(response => {
          distilleries.value = response.data;
        })
        .catch(error => {
          if(error.response){
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.header);
          }
          console.error('Error fetching distilleries:', error);
        });

    return {
      distilleries
    };
  }
};
</script>