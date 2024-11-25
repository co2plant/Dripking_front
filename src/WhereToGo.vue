<template>
  <Header/>
  <LocationLists/>
  <Footer/>
</template>

<script setup>
import { onMounted } from 'vue';
import axios from 'axios';
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LocationLists from "@/components/LocationLists.vue";

onMounted(() => {
  axios.get("/api/items").then((response) => {
    console.log(response);
  });
});
</script>

<style>
#whereToGo {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
