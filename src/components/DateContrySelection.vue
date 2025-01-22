<script setup>

</script>

<template>
  <!-- Date and Country Selection Section -->
  <div class="max-w-[1800px] mx-auto px-4 mb-8 md:mb-12">
    <div class="bg-zinc-50 rounded-lg p-4 md:p-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
        <!-- Date Selection -->
        <div class="space-y-2 md:space-y-3">
          <label class="block text-zinc-900 font-medium text-sm md:text-base">여행 날짜</label>
          <div class="flex gap-2 md:gap-4">
            <div class="flex-1">
              <label class="block text-xs md:text-sm text-zinc-600 mb-1">출발</label>
              <input
                  type="date"
                  v-model="startDate"
                  class="w-full px-3 md:px-4 py-2 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
              >
            </div>
            <div class="flex-1">
              <label class="block text-xs md:text-sm text-zinc-600 mb-1">도착</label>
              <input
                  type="date"
                  v-model="endDate"
                  class="w-full px-3 md:px-4 py-2 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
              >
            </div>
          </div>
        </div>

        <!-- Country Selection -->
        <div class="space-y-2 md:space-y-3">
          <label class="block text-zinc-900 font-medium text-sm md:text-base">국가 선택</label>
          <select
              v-model="selectedCountry"
              class="w-full px-3 md:px-4 py-2 rounded-lg border border-zinc-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-sm md:text-base"
          >
            <option value="">모든 국가</option>
            <option v-for="country in countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>
      </div>

      <!-- Filter Button -->
      <div class="mt-4 md:mt-6 text-center">
        <button
            @click="applyFilters"
            class="bg-amber-400 text-zinc-900 px-6 md:px-8 py-2 rounded-full hover:bg-amber-500 transition-colors duration-300 text-sm md:text-base"
        >
          검색하기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>