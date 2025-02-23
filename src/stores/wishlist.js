// src/stores/wishlist.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useWishlistStore = defineStore('wishlist', () => {
    const wishlistItems = ref([]);

    const loadWishlist = () => {
        const savedWishlist = localStorage.getItem('Wishlist');
        if (savedWishlist) {
            wishlistItems.value = JSON.parse(savedWishlist);
        }
    };

    const saveWishlist = () => {
        localStorage.setItem('Wishlist', JSON.stringify(wishlistItems.value));
    };

    const toggleWishlist = (item) => {
        const index = wishlistItems.value.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
        if (index === -1) {
            wishlistItems.value.push(item);
        } else {
            wishlistItems.value.splice(index, 1);
        }
        saveWishlist();
    };

    const isInWishlist = (item) => {
        return wishlistItems.value.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
    };

    return {
        wishlistItems,
        loadWishlist,
        toggleWishlist,
        isInWishlist,
    };
});