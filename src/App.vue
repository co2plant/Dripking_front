<template>
  <Header/>
  <Landing/>
  <Footer/>
</template>

<script>
export default {
  name: 'App',
  props: {
    msg: String
  }
}
</script>

<script setup>
import Header from "@/components/Header.vue";
import Landing from "@/pages/Landing.vue";
import Footer from "@/components/Footer.vue";
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
