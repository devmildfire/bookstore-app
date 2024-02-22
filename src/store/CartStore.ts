import { getCart } from '@/utils/getCart';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { CartItemType, CartItemInsertType } from 'pages/api/cart';

class CartStore {
  cart: CartItemType[] = [];

  constructor() {
    makeObservable(this, {
      cart: observable,
      setCart: action,
      price: computed,
      // discountedPrice: computed,
      // promoAdjustedPrice: computed,
    });
  }

  get price() {
    console.log('Computing cart price from store...');

    let price = 0;

    this.cart.forEach((item) => {
      price +=
        Math.floor((item.price! * (100 - item.discount!)) / 100) *
        item.quantity!;
    });

    return price;
  }

  setCart = async (cartID: string) => {
    this.cart = await getCart({ cartID });
    console.log('setting new cart in MobX store');
  };
}

export const cartStore = new CartStore();
