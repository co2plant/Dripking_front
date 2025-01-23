<template>
  <div class="mx-auto px-4 mb-8 max-w-5xl mx-auto">
    <div class="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
         ref="scrollContainer"
         @mousedown="startDragging"
         @mousemove="handleDragging"
         @mouseup="stopDragging"
         @mouseleave="stopDragging"
         @touchstart="startDragging"
         @touchmove="handleDragging"
         @touchend="stopDragging">
      <div class="flex flex-nowrap space-x-3 p-1 min-w-min justify-center">
        <button
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category.id)"
            class="md:px-6 md:py-3 md:text-base md:w-24 w-18 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap"
            :class="selectedCategory === category.id
            ? 'bg-amber-400 text-zinc-900'
            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
        >
          {{ category.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'

defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategory: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['select-category'])

const scrollContainer = ref(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)

const startDragging = (e) => {
  isDragging.value = true
  const clientX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX
  startX.value = clientX - scrollContainer.value.offsetLeft
  scrollLeft.value = scrollContainer.value.scrollLeft
}

const stopDragging = () => {
  isDragging.value = false
}

const handleDragging = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
  const clientX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX
  const x = clientX - scrollContainer.value.offsetLeft
  const walk = (x - startX.value) * 2
  scrollContainer.value.scrollLeft = scrollLeft.value - walk
}

const selectCategory = (categoryId) => {
  emit('select-category', categoryId)
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>