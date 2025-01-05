<template>
  <div class="bg-white">
    <div class="container mx-auto px-4 py-8">
      <Card
          :toName = "'alcoholDetail'"
          :urlStr ="urlStrAlcohol"
      >
      </Card>
      <VerticalReviewList></VerticalReviewList>
    </div>
  </div>
</template>

<script setup>
import Card from "@/components/Card.vue";
import {useRoute} from "vue-router";
import VerticalReviewList from "@/components/VerticalReviewList.vue";
import axios from "axios";
import {ref} from "vue";

const route = useRoute();
const urlStrAlcohol = 'alcohols/'+route.params.id;

const item = ref({
  content: [],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    offset: 0,
    paged: true,
    unpaged: false
  },
  last: false,
  totalElements: 0,
  totalPages: 0,
  first: true,
  size: 10,
  number: 0,
  sort: {
    empty: false,
    sorted: true,
    unsorted: false
  },
  numberOfElements: 0,
  empty: true
});

const urlStrReview = 'http://localhost:8080/api/reviews?target_id='+ route.params.id+"&reviewType=alcohol&page=1";

axios.get(urlStrReview)
    .then(response => {
      item.value = response.data;
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