import { ref, watch, onMounted } from 'vue';
import Trip from "@/composables/Entity/Trip";
import Plan from "@/composables/Entity/Plan";
import Alcohol from "@/composables/Entity/Alcohol";
import Destination from "@/composables/Entity/Destination";
import Distillery from "@/composables/Entity/Distillery";


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

    const getIndexOfWishlistItem = (item) => {
        return WishlistItems.value.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType)
    }

    const toggleWishlist = (item) => {
        const index = getIndexOfWishlistItem(item)
        if (index === -1) {
            if(item.itemType === 'TRIP'){
                const newItem = new Trip();
                newItem
                    .setId(item.id)
                    .setName(item.name)
                    .setDescription(item.description)
                    .setStartDate(item.start_date)
                    .setEndDate(item.end_date)
                    .setIsLocal(item.isLocal)
                    .setCountry(item.country)
                    .build();
                WishlistItems.value.push(newItem);
            }else if(item.itemType === 'PLAN'){
                const newItem = new Plan();
                newItem
                    .setId(item.id)
                    .setName(item.name)
                    .setDescription(item.description)
                    .setPlanDate(item.plan_date)
                    .setStartTime(item.start_time)
                    .setEndTime(item.end_time)
                    .setPlaceId(item.place_id)
                    .setTripId(item.trip_id)
                    .build();
                WishlistItems.value.push(newItem);
            }else if(item.itemType === 'ALCOHOL'){
                const newItem = new Alcohol();
                newItem
                    .setId(item.id)
                    .setName(item.name)
                    .setDescription(item.description)
                    .setImgUrl(item.img_url)
                    .build();
                WishlistItems.value.push(newItem);
            }else if(item.itemType === 'DISTILLERY'){
                const newItem = new Distillery();
                newItem
                    .setId(item.id)
                    .setName(item.name)
                    .setDescription(item.description)
                    .setImgUrl(item.img_url)
                    .setLatitude(item.latitude)
                    .setLongitude(item.longitude)
                    .build();
                WishlistItems.value.push(newItem);
            }else if(item.itemType === 'DESTINATION'){
                const newItem = new Destination();
                newItem
                    .setId(item.id)
                    .setName(item.name)
                    .setDescription(item.description)
                    .setImgUrl(item.img_url)
                    .setLatitude(item.latitude)
                    .setLongitude(item.longitude)
                    .build();
                WishlistItems.value.push(newItem);
            }else{
                return false;
            }
        } else {
            WishlistItems.value.splice(index, 1)
        }
        WishlistItems.value.sort((a, b) => a.trip_id - b.trip_id);
        return true;
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

    const setTripId = (item, trip_id) => {
        const index = getIndexOfWishlistItem(item)
        if (index !== -1) {
            WishlistItems.value[index].trip_id = Number(trip_id)
        }

    }
    const setPlanId = (item, plan_id) => {
        const index = getIndexOfWishlistItem(item)
        if (index !== -1) {
            WishlistItems.value[index].plan_id = Number(plan_id)
        }

    }

    /* Wishlist에서 특정 plan의 trip_id를 변경할 때 사용
     * @param
     * item_trip_id : 현재 item의 trip_id,
     * item_id : 현재 item의 id,
     * update_trip_id : 현재 item의 바뀔 trip_id
     */
    const toggleWishlistUpdatePlanID = (item_trip_id, item_id, update_trip_id) => {
        const index = WishlistItems.value.findIndex(wishItem => wishItem.id === Number(item_id) && wishItem.trip_id === Number(item_trip_id))

        if (index === -1) {
            return
        } else {
            WishlistItems.value[index].trip_id = Number(update_trip_id)
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
        deleteAllFromWishlistByTripId,
        setTripId,
        setPlanId
    };
}