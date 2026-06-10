<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import {onMounted, ref} from "vue";
import WishListSideBar from "@/components/WishListSideBar.vue";
import {apiService} from "@/services/api";
import NearbyPositionFilter from "@/components/NearbyPositionFilter.vue";
import ListLocationMap from "@/components/ListLocationMap.vue";
import ChipFilterBar from "@/components/ChipFilterBar.vue";

const countries = ref([]);
const selectedCountry = ref(0);
const coordinateBounds = ref(null);

const handleViewDetails = (item) => {
  router.push({ name: 'destinationDetail', params: { id: item.id } })
}
const selectCountry = (countryId) => {
  selectedCountry.value = Number(countryId) || 0
}
const updateCoordinateBounds = (bounds) => {
  coordinateBounds.value = bounds
}

onMounted(async () => {
  try{
    countries.value = await apiService.get('countries');
  } catch (error) {
    console.error("API 호출 오류:", error);
  }
})

</script>

<template>
  <div class="py-8">
    <div class="mx-auto max-w-5xl px-4">
      <h1 class="mb-8 text-3xl font-bold text-zinc-900">
        <span class="inline-block h-1 w-20 bg-amber-400"></span>
        목적지 목록
        <span class="inline-block h-1 w-20 bg-amber-400"></span>
      </h1>
      <ChipFilterBar
          v-model:selected-value="selectedCountry"
          label="국가"
          :items="countries"
          @select="selectCountry"
      >
        <template #action>
          <router-link
              :to="{ name: 'tripCreate' }"
              class="inline-flex h-10 w-full items-center justify-center rounded-md bg-amber-400 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500 sm:w-auto"
          >
            여행 만들기
          </router-link>
        </template>
      </ChipFilterBar>
    </div>
    <ListLocationMap
        endpoint="destinations/markers"
        itemType="DESTINATION"
        detailRouteName="destinationDetail"
    />
    <NearbyPositionFilter
        @update-coordinate-bounds="updateCoordinateBounds"
    />
    <WishListSideBar />
    <VerticalScrollCardList
        itemType="DESTINATION"
        :selectedItem="selectedCountry"
        :coordinateBounds="coordinateBounds"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>
