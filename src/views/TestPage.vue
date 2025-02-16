<template>
  <div class="h-screen flex flex-col">
    <div class="p-4 bg-amber-100">
      <h2 class="text-2xl font-bold mb-4">술 관련 명소 지도</h2>
      <div class="flex space-x-4 mb-4">
        <button
            v-for="category in categories"
            :key="category"
            @click="toggleCategory(category)"
            :class="[
            'px-4 py-2 rounded-full',
            selectedCategories.includes(category)
              ? 'bg-amber-500 text-white'
              : 'bg-white text-amber-500 border border-amber-500'
          ]"
        >
          {{ category }}
        </button>
      </div>
    </div>
    <iframe
        width="600"
        height="450"
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed/v1/place?key=
    &q=Space+Needle,Seattle+WA">
    </iframe>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// State
const selectedCategories = ref(['distillery', 'bar', 'brewery'])
const categories = ['distillery', 'bar', 'brewery']

const toggleCategory = (category) => {
  const index = selectedCategories.value.indexOf(category)
  if (index > -1) {
    selectedCategories.value.splice(index, 1)
  } else {
    selectedCategories.value.push(category)
  }
}

</script>

<style scoped>
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>