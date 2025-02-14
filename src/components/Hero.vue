<script setup>

</script>

<template>
  <section class="relative h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 z-0">
      <img src="../assets/hero-background.png" alt="Traditional Korean alcoholic drinks" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-zinc-900/60"></div>
    </div>
    <div class="relative z-10 text-center text-white">
      <h1 class="text-3xl md:text-7xl font-bold mb-6">대한민국의 술문화를 만나다</h1>
      <p class="text-l md:text-2xl mb-8">전통주부터 현대의 크래프트 술까지, 한국 술의 모든 것</p>
      <div class="flex justify-center space-x-4">
        <router-link to="/alcoholList">
          <button class="bg-amber-400 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors duration-300">
            술 탐험하기
          </button>
        </router-link>
        <router-link to="/distilleryList">
          <button class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-zinc-900 transition-colors duration-300">
            양조장 여행
          </button>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>