<template>
  <div class="bg-zinc-100">
    <Hero/>
    <section class="bg-white py-5">
      <SearchBar />
    </section>
    <RecommendationSection />
    <PopularItemSection
        title="인기 여행지"
        subtitle="최근 사용자 상호작용을 바탕으로 많이 주목받은 여행지입니다."
        endpoint="recommendations/popular-destinations"
        detail-route-name="destinationDetail"
    />
    <PopularItemSection
        title="인기 술"
        subtitle="위시리스트, 상세 조회, 여행 계획 추가 신호를 반영합니다."
        endpoint="recommendations/popular-alcohols"
        detail-route-name="alcoholDetail"
    />
  </div>
</template>

<script setup>
  import Hero from "@/components/Hero.vue";
  import SearchBar from "@/components/SearchBar.vue";
  import RecommendationSection from "@/components/RecommendationSection.vue";
  import PopularItemSection from "@/components/PopularItemSection.vue";
</script>
