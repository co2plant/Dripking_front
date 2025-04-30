<template>
  <section class="py-4 bg-white">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <span class="inline-block w-20 h-1 ml-2"></span>
        <!-- Wishlist Icon with Counter -->
        <div class="relative">
          <ShoppingCartIcon
              class="h-6 w-6 text-zinc-900 cursor-pointer"
              @click="isWishlistOpen = true"
          />
          <span v-if="wishStore.WishItems.length"
                class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="isWishlistOpen = true">
                      {{ wishStore.WishItems.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Wishlist Sidebar -->
    <div v-if="isWishlistOpen"
         class="fixed inset-0 bg-black bg-opacity-50 z-50"
         @click="isWishlistOpen = false">
      <div class="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6"
           @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h4 class="text-xl font-bold text-zinc-900">Wishlist</h4>
          <XIcon
              class="h-6 w-6 text-zinc-900 cursor-pointer"
              @click="isWishlistOpen = false"
          />
        </div>
        <div class="h-full overflow-auto">
          <div v-if="wishStore.WishItems.length" class="space-y-4 wrapper">
            <div v-for="item_trip in tripStore.Trips"
                 :key="item_trip.id"
                 :id="item_trip.id"
                 class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg relative">
              <!-- Delete Trip Button -->
              <button
                  @click="deleteAllPlansByTripId(item_trip.id)"
                  class="absolute top-2 right-2 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label="Delete trip"
              >
                <XIcon class="h-5 w-5"/>
              </button>

              <span class="font-bold text-zinc-900">{{ item_trip.name }}</span>
              <span class="text-zinc-600">{{ item_trip.start_date }} ~ {{ item_trip.end_date }}</span>
              <div class="dragula-container container min-h-24" :data-trip-id="item_trip.id">
                <div v-for="item in planStore.Plans.filter(plan => plan.trip_id === item_trip.id)"
                     :key="item.id"
                     :data-item-id="item.id"
                     :data-item-trip-id="item.trip_id"
                     class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                  <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                    <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <button
                      @click="deletePlanById(item.id)"
                      class="text-zinc-900 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon class="h-5 w-5"/>
                  </button>
                </div>
              </div>
              <div class="mt-4 md:mt-6 text-center">
                <router-link :to="{ name : 'tripModify', params : {id: item_trip.id}}">
                  <button
                      class="bg-amber-400 text-zinc-900 px-6 md:px-8 py-2 rounded-full hover:bg-amber-500 transition-colors duration-300 text-sm md:text-base"
                  >
                    다음
                  </button>
                </router-link>
              </div>
            </div>
            <div id="item_trip-1"
                 class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg">
              <span class="font-bold text-zinc-900"> Wish </span>
              <div class="dragula-container min-h-24" :data-trip-id="-1">
                <div v-for="item in wishStore.WishItems"
                     :key="item.id"
                     :data-item-id="item.id"
                     :data-item-trip-id="item.trip_id"
                     class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                  <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                    <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                  </div>
                  <button
                      @click="wishStore.toggleWishlist(item)"
                      class="text-zinc-900 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon class="h-5 w-5"/>
                  </button>
                </div>
              </div>
            </div>
            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between text-xl font-bold text-zinc-900">
                <!--                <span>Total:</span>-->
                <!--                <span>${{ calculateTotal() }}</span>-->
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-zinc-600">
            Your wishlist is empty
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import {ShoppingCartIcon, XIcon, TrashIcon} from 'lucide-vue-next';
import {useTripStore} from "@/stores/useTripStore";
import {useWishStore} from "@/stores/useWishStore";
import {usePlanStore} from "@/stores/usePlanStore";

const tripStore = useTripStore();
const wishStore = useWishStore();
const planStore = usePlanStore();
const isWishlistOpen = ref(false);

onMounted(() => {
  tripStore.loadTrips();
  planStore.loadPlans();
  wishStore.loadWishlist();
});

onUnmounted(() => {
  tripStore.sortTrips();
  tripStore.updateTrip();
  wishStore.sortWishlist();
  wishStore.saveWishlist();
})

const deletePlanById = (plan_id) => {
  planStore.removePlan(plan_id);
  planStore.savePlans();
}

const deleteAllPlansByTripId = (trip_id) => {
  planStore.clearPlansByTripId(trip_id);
  tripStore.removeTrip(trip_id);
  planStore.savePlans();
  tripStore.updateTrip();
  console.log(trip_id);
}
</script>

<style scoped>

</style>
