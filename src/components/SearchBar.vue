<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="flex flex-wrap gap-4 justify-between p-4">
      <button
          v-for="item in searchItem"
          :key="item.value"
          @click="toggleSelection(item.value)"
          :class="[
          'px-8 py-3 rounded-lg border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          isSelected(item.value)
            ? 'text-blue-600 border-blue-600'
            : 'bg-white text-gray-900 border-gray-200 hover:border-blue-600',
          item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
          :disabled="item.disabled"
      >
        {{ item.label }}
      </button>
    </div>
    <form :action="urlStr" method="GET" class="px-4" role="search" autocomplete="off" accept-charset="UTF-8">
      <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
      <div class="relative mb-4">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input type="text" name="searchKeyword" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="검색" required />
      </div>
      <button type="submit" class="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchItem = [
  { value: 'distillery', label: 'Distillery' },
  { value: 'destination', label: 'Destination' },
  { value: 'alcohol', label: 'Alcohol' },
]

const selectedItem = ref(new Set())

let urlStr= null

// URL 파라미터에서 초기 선택값 가져오기
onMounted(() => {
  const dtypeParam = route.query.dType
  if (dtypeParam) {
    const initialSelections = dtypeParam.split(',')
    selectedItem.value = new Set(initialSelections)
  }
})

const toggleSelection = (value) => {
  selectedItem.value.clear()
  selectedItem.value.add(value)
  // URL 파라미터 업데이트
  updateUrlParams()
  updateUrlStr()
}

const isSelected = (value) => {
  return selectedItem.value.has(value)
}

const updateUrlParams = () => {
  const selectedValues = Array.from(selectedItem.value)
  router.push({
    query: {
      ...route.query,
      dtype: selectedValues.length > 0 ? selectedValues.join(',') : undefined
    }
  })
}

const updateUrlStr = () => {
  urlStr = "http://localhost:3000/search/" + Array.from(selectedItem.value) + "/"
}

</script>