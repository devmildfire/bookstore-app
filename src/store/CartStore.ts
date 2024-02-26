import { setOrGetCartCookie } from '@/utils/cardID';
import { getCart } from '@/utils/getCart';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { CartItemType } from 'pages/api/cart';

export class CartStore {
  cart: CartItemType[] = [];
  cartID: string | undefined = '';

  constructor() {
    makeObservable(this, {
      cartID: observable,
      cart: observable,
      setCart: action,
      price: computed,
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

  setCartID = () => {
    this.cartID = setOrGetCartCookie()!.toString();
    console.log('getting cartID from coockie')
  } 

  setCart = async (cartID: string) => {
    this.cart = await getCart(cartID);
    console.log('setting new cart in MobX store');
  };
}

export const cartStore = new CartStore();
