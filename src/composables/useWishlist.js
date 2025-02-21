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

    /* Wishlist에서 Trip을 삭제할때 Trip에 속한 Plan도 같이 삭제
     * @param item
     */
    const deleteAllFromWishlistByTripId = (item) => {
        toggleWishlist(item);
        WishlistItems.value.forEach((wishItem, index) => {
            if (wishItem.itemType !== 'TRIP' && wishItem.trip_id === item.id) {
                WishlistItems.value.splice(index, 1)
            }
        });
    }

    /* Wishlis에서 특정 plan의 trip_id를 변경할 때 사용
     * @param item_trip_id, item_id, update_trip_id
     */
    const toggleWishlistUpdatePlanID = (item_trip_id, item_id, update_trip_id) => {
        const index = WishlistItems.value.findIndex(wishItem => wishItem.id === Number(item_id) && wishItem.trip_id === Number(item_trip_id))
        const item = WishlistItems.value[index]

        const newItem = {
            id: item.id,
            trip_id: Number(update_trip_id),
            plan_id: -1,
            itemType: item.itemType,
            name: item.name,
            description: item.description,
            img_url: item.img_url
        }
        if (index === -1) {
            return
        } else {
            WishlistItems.value.splice(index, 1)
            WishlistItems.value.push(newItem)
        }
        WishlistItems.value.sort((a, b) => a.trip_id - b.trip_id);
    };

    /* Wishlist에 item이 있는지 확인
     * @param item
     */
    const isInWishlist = (item) => {
        return WishlistItems.value.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
    };

    onMounted(loadWishlist);

    watch(WishlistItems, saveWishlist, { deep: true });

    return {
        WishlistItems,
        toggleWishlistUpdatePlanID,
        toggleWishlist,
        isInWishlist,
        deleteAllFromWishlistByTripId
    };
}