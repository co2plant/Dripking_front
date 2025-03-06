import { defineStore } from 'pinia';

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
        addWishItem(newWishItem){
            if(newWishItem!==null){
                this.WishItems.push(newWishItem);
            }
        },
        removeWishItem(wishItemId){
            this.WishItems = this.WishItems.filter(wishItem => wishItem.id !== wishItemId);
        },
        toggleWishlist(item){
            const index = this.WishItems.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
            if(index === -1){
                this.WishItems.push(item);
            }else{
                this.WishItems.splice(index, 1);
            }
            this.saveWishlist();
        },
        isInWishlist(item){
            return this.WishItems.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
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