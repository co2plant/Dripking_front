import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
    state: () => ({wishlistItems:[]}),
    getters: {},
    actions:{
        loadWishlist(){
            const savedWishlist = localStorage.getItem('Wishlist');
            if(savedWishlist){
                this.wishlistItems = JSON.parse(savedWishlist);
            }
        },
        saveWishlist(){
            localStorage.setItem('Wishlist', JSON.stringify(this.wishlistItems));
        },
        addWishItem(newWishItem){
            if(newWishItem!==null){
                this.wishlistItems.push(newWishItem);
                this.saveWishlist();
            }
        },
        removeWishItem(wishItemId){
            this.wishlistItems = this.wishlistItems.filter(wishItem => wishItem.id !== wishItemId);
            this.saveWishlist();
        },
        toggleWishlist(item){
            const index = this.wishlistItems.findIndex(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
            if(index === -1){
                this.wishlistItems.push(item);
            }else{
                this.wishlistItems.splice(index, 1);
            }
            this.saveWishlist();
        },
        isInWishlist(item){
            return this.wishlistItems.some(wishItem => wishItem.id === item.id && wishItem.itemType === item.itemType);
        },
        sortWishlist(){
            return [...this.wishlistItems].sort((a, b) => {
                const A = a.id;
                const B = b.id;
                return A - B;
            })
        },
    },
});