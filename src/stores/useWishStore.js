import { defineStore } from 'pinia';
import Alcohol from '@/composables/Entity/Alcohol'
import Distillery from '@/composables/Entity/Distillery'
import Destination from '@/composables/Entity/Destination'
import Place from '@/composables/Entity/Place'

export const useWishStore = defineStore('wishlist', {
    state: () => ({WishItems:[]}),
    getters: {},
    actions:{
        loadWishlist(){
            const savedWishlist = localStorage.getItem('Wishlist');
            if(savedWishlist!==null){
                this.WishItems = JSON.parse(savedWishlist);
            }
        },
        saveWishlist(){
            if(this.WishItems.length !== 0){
                localStorage.setItem('Wishlist', JSON.stringify(this.WishItems));
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
        toggleWishlist(item, itemType) {
            let entity;
            switch (itemType) {
                case 'ALCOHOL':
                    entity = new Alcohol()
                        .setId(item.id)
                        .setName(item.name)
                        .setDescription(item.description)
                        .setImgUrl(item.img_url)
                        .setPlanId(item.plan_id)
                        .build();
                    break;
                case 'DISTILLERY':
                    entity = new Distillery()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(item.latitude)
                        .setLongitude(item.longitude)
                        .setAddress(item.address)
                        .setDescription(item.description)
                        .setImgUrl(item.img_url)
                        .setPlanID(item.plan_id)
                        .build();
                    break;
                case 'DESTINATION':
                    entity = new Destination()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(item.latitude)
                        .setLongitude(item.longitude)
                        .setDescription(item.description)
                        .setImgUrl(item.img_url)
                        .setPlanID(item.plan_id)
                        .build();
                    break;
                case 'PLACE':
                    entity = new Place()
                        .setId(item.id)
                        .setName(item.name)
                        .setLatitude(item.latitude)
                        .setLongitude(item.longitude)
                        .setAddress(item.address)
                        .setDescription(item.description)
                        .setImgUrl(item.img_url)
                        .setPlanID(item.plan_id)
                        .build();
                    break;
                default:
                    entity = { ...item, itemType };
            }

            const index = this.WishItems.findIndex(wishItem => wishItem.id === entity.id && wishItem.itemType === itemType);
            if (index === -1) {
                this.WishItems.push(entity);
            } else {
                this.WishItems.splice(index, 1);
            }
            this.saveWishlist();
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
