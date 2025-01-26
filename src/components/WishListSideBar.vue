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
          <span v-if="WishlistItems.length"
                class="absolute -top-2 -right-2 bg-amber-400 text-zinc-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                @click="isWishlistOpen = true">
                      {{ WishlistItems.length }}
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

        <div v-if="WishlistItems.length" class="space-y-4">
          <div v-for="item in WishlistItems"
               :key="item.id"
               class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
  import { ref } from 'vue';
  import { useWishlist } from '@/composables/useWishlist';
  import {ShoppingCartIcon, XIcon, TrashIcon} from 'lucide-vue-next';

  const { WishlistItems, toggleWishlist} = useWishlist();

  const isWishlistOpen = ref(false);
</script>

<style scoped>

</style>