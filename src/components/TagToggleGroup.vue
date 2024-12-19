<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">RAM</h2>
      <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">
        See performance specs
      </a>
    </div>

    <div class="flex flex-wrap gap-4">
      <button
          v-for="size in ramSizes"
          :key="size.value"
          @click="toggleSelection(size.value)"
          :class="[
          'px-8 py-3 rounded-lg border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          isSelected(size.value)
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-900 border-gray-200 hover:border-blue-600',
          size.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
          :disabled="size.disabled"
      >
        {{ size.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const ramSizes = [
  { value: '4', label: '4 GB' },
  { value: '8', label: '8 GB' },
  { value: '16', label: '16 GB' },
  { value: '32', label: '32 GB' },
  { value: '64', label: '64 GB' },
  { value: '128', label: '128 GB', disabled: true }
]

const selectedRam = ref(new Set())

// URL 파라미터에서 초기 선택값 가져오기
onMounted(() => {
  const ramParam = route.query.ram
  if (ramParam) {
    const initialSelections = ramParam.split(',')
    selectedRam.value = new Set(initialSelections)
  }
})

const toggleSelection = (value) => {
  if (selectedRam.value.has(value)) {
    selectedRam.value.delete(value)
  } else {
    selectedRam.value.add(value)
  }

  // URL 파라미터 업데이트
  updateUrlParams()
}

const isSelected = (value) => {
  return selectedRam.value.has(value)
}

const updateUrlParams = () => {
  const selectedValues = Array.from(selectedRam.value)
  router.push({
    query: {
      ...route.query,
      ram: selectedValues.length > 0 ? selectedValues.join(',') : undefined
    }
  })
}
</script>