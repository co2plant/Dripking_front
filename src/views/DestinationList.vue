<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import DateCountrySelection from "@/components/DateCountrySelection.vue";
import {onMounted, ref} from "vue";
import WishListSideBar from "@/components/WishListSideBar.vue";
import {apiService} from "@/services/api";

const countries = ref([]);
const selectedCountry = ref(0);

const handleViewDetails = (item) => {
  router.push({ name: 'destinationDetail', params: { id: item.id } })
}
const selectCountry = (countryId) => {
  selectedCountry.value = countryId
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
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-zinc-900 mb-8">
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
      목적지 목록
      <span class="inline-block bg-amber-400 w-20 h-1"></span>
    </h1>
    <DateCountrySelection
        :countries="countries"
        :selectedCountry="selectedCountry"
        @select-country="selectCountry"
    >
    </DateCountrySelection>
    <WishListSideBar />
    <VerticalScrollCardList
        itemType="DESTINATION"
        :selectedItem="selectedCountry"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>