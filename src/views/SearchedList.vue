<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import SearchBar from "@/components/SearchBar.vue";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();

const searchConfig = {
  alcohol: {
    label: '술',
    itemType: 'ALCOHOL',
    detailRouteName: 'alcoholDetail',
  },
  distillery: {
    label: '양조장',
    itemType: 'DISTILLERY',
    detailRouteName: 'distilleryDetail',
  },
  destination: {
    label: '여행지',
    itemType: 'DESTINATION',
    detailRouteName: 'destinationDetail',
  },
};

const currentConfig = computed(() => searchConfig[route.params.dtype] || searchConfig.alcohol);
const searchKeyword = computed(() => typeof route.query.searchKeyword === 'string' ? route.query.searchKeyword.trim() : '');

const handleViewDetails = (item) => {
  router.push({name: currentConfig.value.detailRouteName, params: {id: item.id}});
};
</script>

<template>
  <main class="min-h-screen bg-zinc-100 px-4 py-8">
    <section class="mx-auto max-w-5xl">
      <h1 class="text-3xl font-bold text-zinc-950">검색 결과</h1>
      <p class="mt-2 text-sm text-zinc-500">
        {{ currentConfig.label }} 이름 검색: {{ searchKeyword || '-' }}
      </p>
    </section>
    <SearchBar class="mt-3" />
    <VerticalScrollCardList
        v-if="searchKeyword"
        :key="`${currentConfig.itemType}-${searchKeyword}`"
        :itemType="currentConfig.itemType"
        :searchKeyword="searchKeyword"
        @view-details="handleViewDetails"
    />
    <div v-else class="mx-auto mt-10 max-w-5xl rounded-md border border-zinc-200 bg-white px-4 py-10 text-center text-sm text-zinc-500">
      검색어를 입력해주세요.
    </div>
  </main>
</template>

<style scoped>
</style>
