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
          <span v-if="WishlistItems.filter((i) => i.itemType !== 'TRIP' && i.itemType !== 'Plan').length"
                class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="isWishlistOpen = true">
                      {{ WishlistItems.filter((i) => i.itemType !== 'TRIP' && i.itemType !== 'Plan').length }}
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

        <div v-if="WishlistItems.length" class="space-y-4 wrapper">
          <div v-for="item_trip in WishlistItems.filter((i) => i.itemType === 'TRIP')"
               :key="item_trip.id"
               :id="'item_trip' + item_trip.id"
               class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg">
            <span class="font-bold text-zinc-900">{{ item_trip.name }}</span>
            <span class="text-zinc-600">{{ item_trip.start_date }} ~ {{ item_trip.end_date }}</span>
            <div class="dragula-container container min-h-24" :data-trip-id="item_trip.id">
              <div v-for="item in WishlistItems.filter((i) => i.itemType !== 'TRIP' &&  item_trip.id === i.trip_id)"
                   :key="item.id"
                   :data-item-id="item.id"
                   :data-item-trip_id="item.trip_id"
                   class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
                <div class="flex-1">
                  <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                  <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                </div>
                <button
                    @click="toggleWishlist(item)"
                    class="text-zinc-900 hover:text-red-500 transition-colors"
                >
                  <TrashIcon class="h-5 w-5"/>
                </button>
              </div>
            </div>
          </div>
          <div id="item_trip-1"
               class="grid grid-cols-1 items-center p-4 bg-gray-50 rounded-lg">
            <span class="font-bold text-zinc-900"> 미배정상태 </span>
            <div class="dragula-container min-h-24"  :data-trip-id="-1">
              <div v-for="item in WishlistItems.filter((i) => i.itemType !== 'TRIP' &&  -1 === i.trip_id)"
                   :key="item.id"
                   :data-item-id="item.id"
                   :data-item-trip_id="item.trip_id"
                   class="flex items-center my-3 p-4 bg-amber-100 rounded-lg">
                <img :src="item.img_url" :alt="item.name" class="w-20 h-20 object-cover rounded">
                <div class="flex-1">
                  <h5 class="font-bold text-zinc-900 line-clamp-1">{{ item.name }}</h5>
                  <p class="text-zinc-600 line-clamp-2">{{ item.description }}</p>
                </div>
                <button
                    @click="toggleWishlist(item)"
                    class="text-zinc-900 hover:text-red-500 transition-colors"
                >
                  <TrashIcon class="h-5 w-5"/>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-4 md:mt-6 text-center">
            <button
                class="bg-amber-400 text-zinc-900 px-6 md:px-8 py-2 rounded-full hover:bg-amber-500 transition-colors duration-300 text-sm md:text-base"
            >
              저장
            </button>
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
  </section>
</template>

<script setup>
import {ref} from 'vue';
import {useWishlist} from '@/composables/useWishlist';
import {ShoppingCartIcon, XIcon, TrashIcon} from 'lucide-vue-next';
import dragula from "dragula";
import 'dragula/dist/dragula.min.css';

const {WishlistItems, toggleWishlist, toggleWishlistUpdatePlanID} = useWishlist();

const isWishlistOpen = ref(false);

let drake = dragula({
  isContainer: function (el) {
    return el.classList.contains('dragula-container');
  },
  direction: 'vertical',             // Y axis is considered when determining where an element would be dropped
  copy: false,                       // elements are moved by default, not copied
  copySortSource: false,             // elements in copy-source containers can be reordered
  revertOnSpill: false,              // spilling will put the element back where it was dragged from, if this is true
  removeOnSpill: false,              // spilling will `.remove` the element, if this is true
  mirrorContainer: document.body,    // set the element that gets mirror elements appended
  ignoreInputTextSelection: true,     // allows users to select input text, see details below
  slideFactorX: 0,               // allows users to select the amount of movement on the X axis before it is considered a drag instead of a click
  slideFactorY: 0,               // allows users to select the amount of movement on the Y axis before it is considered a drag instead of a click
});

drake.on('drop', (el, target) => {
  const tripId = target.getAttribute('data-trip-id');
  const itemId = el.getAttribute('data-item-id')
  const itemTripId = el.getAttribute('data-item-trip_id');

  if (tripId !== null && itemTripId !== null) {
    toggleWishlistUpdatePlanID(itemTripId, itemId, tripId);
  } else {
    console.error('Failed to get tripId or itemTripId');
  }
})
</script>

<style scoped>

</style>