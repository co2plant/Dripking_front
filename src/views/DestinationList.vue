<script setup>
import VerticalScrollCardList from "@/components/VerticalScrollCardList.vue";
import router from "@/router";
import DateCountrySelection from "@/components/DateCountrySelection.vue";
import {onMounted, ref} from "vue";

const countries = ref([]);
const selectedCountry = ref(0);

const handleViewDetails = (item) => {
  router.push({ name: 'destinationDetail', params: { id: item.id } })
}

const fetchItems = async () => {
  const response = await fetch('http://localhost:8080/api/countries');
  return await response.json();
}

const selectCountry = (countryId) => {
  selectedCountry.value = countryId
}

onMounted(async () => {
  countries.value = await fetchItems();
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
    <VerticalScrollCardList
        itemType="DESTINATION"
        :selectedItem="selectedCountry"
        @view-details="handleViewDetails"
    />
  </div>
</template>

<style scoped>
</style>