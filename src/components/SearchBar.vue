<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-6">
    <div class="mb-3 grid grid-cols-3 gap-2 rounded-md border border-zinc-200 bg-white p-1">
      <button
          v-for="item in searchItem"
          :key="item.value"
          type="button"
          @click="selectedType = item.value"
          :class="[
            'h-10 rounded px-3 text-sm font-medium transition-colors',
            selectedType === item.value ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
          ]"
      >
        {{ item.label }}
      </button>
    </div>
    <form @submit.prevent="submitSearch" role="search" autocomplete="off">
      <label for="catalog-search" class="sr-only">검색</label>
      <div class="flex gap-2">
        <div class="relative min-w-0 flex-1">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-4 w-4 text-zinc-400" />
          </div>
          <input
              v-model.trim="keyword"
              type="search"
              id="catalog-search"
              class="h-11 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="이름으로 검색"
              required
          />
        </div>
        <button type="submit" class="h-11 rounded-md bg-amber-400 px-5 text-sm font-semibold text-zinc-950 hover:bg-amber-500">
          검색
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchItem = [
  { value: 'alcohol', label: '술' },
  { value: 'distillery', label: '양조장' },
  { value: 'destination', label: '여행지' },
]

const allowedTypes = searchItem.map(item => item.value)
const selectedType = ref(allowedTypes.includes(route.params.dtype) ? route.params.dtype : 'alcohol')
const keyword = ref(typeof route.query.searchKeyword === 'string' ? route.query.searchKeyword : '')

watch(() => route.params.dtype, (nextType) => {
  if (allowedTypes.includes(nextType)) {
    selectedType.value = nextType
  }
})

watch(() => route.query.searchKeyword, (nextKeyword) => {
  keyword.value = typeof nextKeyword === 'string' ? nextKeyword : ''
})

const submitSearch = () => {
  const nextKeyword = keyword.value.trim()
  if (!nextKeyword) return
  router.push({
    name: 'searchList',
    params: { dtype: selectedType.value },
    query: {
      searchKeyword: nextKeyword
    }
  })
}
</script>
