// src/stores/useWishStore.js
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

    const addWishItem = (newWishItem) => {
        wishlistItems.value.push(newWishItem);
        saveWishlist();
    }

    const removeWishItem = (wishItemId) => {
        wishlistItems.value = wishlistItems.value.filter(wishItem => wishItem.id !== wishItemId);
        saveWishlist();
    }

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

    const sortWishlist = () => {
        return [...wishlistItems.value].sort((a, b) => {
            const A = a.id;
            const B = b.id;
            return A - B;
        })
    }

    return {
        wishlistItems,
        loadWishlist,
        addWishItem,
        removeWishItem,
        toggleWishlist,
        isInWishlist,
        sortWishlist
    };
});