import { defineStore } from 'pinia';
import Alcohol from '@/composables/Entity/Alcohol'
import Distillery from '@/composables/Entity/Distillery'
import Destination from '@/composables/Entity/Destination'
import Place from '@/composables/Entity/Place'
import { normalizeCoordinates } from '@/utils/coordinates'
import { apiService } from '@/services/api'
import { recordInteractionEvent } from '@/services/interactionEvents'

const getImageUrl = (item) => item.imgUrl || item.img_url;
const getPlanId = (item) => item.planId || item.plan_id;
const WISHLIST_STORAGE_KEY = 'Wishlist';
const SERVER_WISHLIST_ITEM_TYPES = new Set(['ALCOHOL', 'DISTILLERY', 'DESTINATION']);

const hasAuthorization = () => Boolean(localStorage.getItem('Authorization'));

const readLocalWishlist = () => {
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (savedWishlist === null) {
        return [];
    }

    try {
        const parsedWishlist = JSON.parse(savedWishlist);
        return Array.isArray(parsedWishlist) ? parsedWishlist : [];
    } catch (err) {
        console.error('Wishlist parsing error:', err);
        return [];
    }
};

const getTargetId = (item) => item?.targetId ?? item?.id;

const isServerSyncable = (item) => SERVER_WISHLIST_ITEM_TYPES.has(item?.itemType) && getTargetId(item) != null;

const buildWishlistRequest = (item) => {
    if (!isServerSyncable(item)) {
        return null;
    }

    return {
        itemType: item.itemType,
        targetId: getTargetId(item),
    };
};

const normalizeWishlistItem = (item) => {
    const targetId = getTargetId(item);
    const imgUrl = getImageUrl(item);
    return {
        ...item,
        id: targetId,
        targetId,
        imgUrl,
        img_url: imgUrl,
    };
};

const dedupeWishlistItems = (items) => {
    const itemMap = new Map();
    items.forEach((item) => {
        const normalizedItem = normalizeWishlistItem(item);
        itemMap.set(`${normalizedItem.itemType}:${normalizedItem.id}`, normalizedItem);
    });
    return Array.from(itemMap.values());
};

export const useWishStore = defineStore('wishlist', {
    state: () => ({WishItems:[]}),
    getters: {},
    actions:{
        async loadWishlist(){
            const localItems = readLocalWishlist();
            this.WishItems = dedupeWishlistItems(localItems);

            if (hasAuthorization()) {
                await this.loadServerWishlist(localItems);
            }

            return this.WishItems;
        },
        saveWishlist(){
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.WishItems));
        },
        async loadServerWishlist(localItems = this.WishItems){
            try {
                const serverItems = await apiService.getWithToken('wishlist');
                const localOnlyItems = localItems.filter(item => !isServerSyncable(item));
                this.WishItems = dedupeWishlistItems([...serverItems, ...localOnlyItems]);
                this.saveWishlist();
                return { success: true };
            } catch (err) {
                console.error('Loading server wishlist failed:', err);
                return { success: false, error: err.message };
            }
        },
        async syncLocalWishlistToServer(){
            const localItems = dedupeWishlistItems(readLocalWishlist());
            this.WishItems = localItems;

            if (!hasAuthorization()) {
                return { success: false, error: 'Authentication is required.' };
            }

            const syncableItems = localItems.filter(item => isServerSyncable(item));
            const localOnlyItems = localItems.filter(item => !isServerSyncable(item));

            try {
                for (const item of syncableItems) {
                    const request = buildWishlistRequest(item);
                    await apiService.postWithToken('wishlist/items', request);
                }

                return this.loadServerWishlist(localOnlyItems);
            } catch (err) {
                console.error('Wishlist sync failed:', err);
                this.WishItems = localItems;
                this.saveWishlist();
                return { success: false, error: err.message };
            }
        },
        //현재 사용 X
        addWishItem(newWishItem){
            if(newWishItem!==null){
                this.WishItems.push(newWishItem);
            }
        },
        removeWishItem(wishItemId){
            this.WishItems = this.WishItems.filter(wishItem => wishItem.id !== wishItemId);
        },
        async toggleWishlist(item, itemType) {
            let entity;
            const coordinates = normalizeCoordinates(item);
            switch (itemType) {
                case 'ALCOHOL':
                    entity = new Alcohol()
                        .setId(item.id)
                        .setName(item.name)
                        .setDescription(item.description)
                        .setImgUrl(getImageUrl(item))
                        .setPlanId(getPlanId(item))
                        .build();
                    break;
                case 'DISTILLERY':
                    entity = new Distillery()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(coordinates.latitude)
                        .setLongitude(coordinates.longitude)
                        .setAddress(item.address)
                        .setDescription(item.description)
                        .setImgUrl(getImageUrl(item))
                        .setPlanID(getPlanId(item))
                        .build();
                    break;
                case 'DESTINATION':
                    entity = new Destination()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(coordinates.latitude)
                        .setLongitude(coordinates.longitude)
                        .setDescription(item.description)
                        .setImgUrl(getImageUrl(item))
                        .setPlanID(getPlanId(item))
                        .build();
                    break;
                case 'PLACE':
                    entity = new Place()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(coordinates.latitude)
                        .setLongitude(coordinates.longitude)
                        .setAddress(item.address)
                        .setDescription(item.description)
                        .setImgUrl(getImageUrl(item))
                        .setPlanID(getPlanId(item))
                        .build();
                    break;
                default:
                    entity = { ...item, itemType };
            }

            entity = normalizeWishlistItem(entity);
            const index = this.WishItems.findIndex(wishItem => wishItem.id === entity.id && wishItem.itemType === itemType);
            if (index === -1) {
                this.WishItems.push(entity);
                this.saveWishlist();
                recordInteractionEvent(itemType, entity.id, 'WISHLIST_ADD');
                if (hasAuthorization()) {
                    const request = buildWishlistRequest(entity);
                    if (request !== null) {
                        try {
                            const serverItem = normalizeWishlistItem(await apiService.postWithToken('wishlist/items', request));
                            this.WishItems = dedupeWishlistItems([...this.WishItems, serverItem]);
                            this.saveWishlist();
                        } catch (err) {
                            console.error('Adding wishlist item to server failed:', err);
                        }
                    }
                }
            } else {
                const removedItem = this.WishItems[index];
                this.WishItems.splice(index, 1);
                this.saveWishlist();
                if (hasAuthorization()) {
                    const request = buildWishlistRequest(removedItem);
                    if (request !== null) {
                        try {
                            await apiService.deleteWithToken(`wishlist/items?itemType=${encodeURIComponent(request.itemType)}&targetId=${encodeURIComponent(request.targetId)}`);
                        } catch (err) {
                            console.error('Removing wishlist item from server failed:', err);
                            this.WishItems.splice(index, 0, removedItem);
                            this.saveWishlist();
                        }
                    }
                }
            }
        },
        isInWishlist(item, itemType){
            return this.WishItems.some(wishItem => wishItem.id === item.id && wishItem.itemType === itemType);
        },
        sortWishlist(){
            return [...this.WishItems].sort((a, b) => {
                const A = a.id;
                const B = b.id;
                return A - B;
            })
        },
    },
});
