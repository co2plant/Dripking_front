import { ref, watch, onMounted } from 'vue';

export function useWishlist() {
    const WishlistItems = ref([]);

    const loadWishlist = () => {
        const savedWishlist = localStorage.getItem('Wishlist');
        if (savedWishlist) {
            WishlistItems.value = JSON.parse(savedWishlist);
        }
    };

    const saveWishlist = (newItems) => {
        localStorage.setItem('Wishlist', JSON.stringify(newItems));
    };

    const toggleWishlist = (item) => {
        const index = WishlistItems.value.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType)
        if (index === -1) {
            const newItem = {
                id: item.id,
                trip_id: -1,
                plan_id: -1,
                itemType: item.itemType,
                name: item.name,
                description: item.description,
                img_url: item.img_url
            }
            WishlistItems.value.push(newItem)
        } else {
            WishlistItems.value.splice(index, 1)
        }
        WishlistItems.value.sort((a, b) => a.trip_id - b.trip_id);
    };

    const toggleWishlistUpdatePlanID = (item, update_id) => {
        const index = WishlistItems.value.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType)
        const newItem = {
            id: item.id,
            trip_id: update_id,
            plan_id: -1,
            itemType: item.itemType,
            name: item.name,
            description: item.description,
            img_url: item.img_url
        }
        if (index === -1) {
            WishlistItems.value.push(newItem)
        } else {
            WishlistItems.value.splice(index, 1)
            WishlistItems.value.push(newItem)
        }
        WishlistItems.value.sort((a, b) => a.trip_id - b.trip_id);
    };

    const isInWishlist = (item) => {
        return WishlistItems.value.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
    };

    onMounted(loadWishlist);

    watch(WishlistItems, saveWishlist, { deep: true });

    return {
        WishlistItems,
        toggleWishlistUpdatePlanID,
        toggleWishlist,
        isInWishlist
    };
}