<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :toName = "'alcoholDetail'"
          :urlStr ="urlStrAlcohol"
      >
      </Card>
      <VerticalReviewList :total-pages="item.totalPages" :current-page="item.pageable.pageNumber" :reviews="item"></VerticalReviewList>
      <pagenation :total-pages="item.totalPages" :current-page="item.pageable.pageNumber"></pagenation>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";
import VerticalReviewList from "@/components/VerticalReviewList.vue";
import Pagenation from "@/components/Pagenation.vue";
import axios from "axios";
import {ref} from "vue";

const route = useRoute();
const urlStrAlcohol = 'alcohols/'+route.params.id;

const item = ref([]);

const urlStrReview = 'http://localhost:8080/api/reviews?target_id='+ route.params.id+"&reviewType=alcohol";
axios.get(urlStrReview)
    .then(response => {
      item.value = response.data;
      console.log("this si alcoholDetail", item.value);
    })
    .catch(
        error => {
          console.error('Error fetching review get function:', error);
        }
    )

</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>