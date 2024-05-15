import { setOrGetCartCookie } from '@/utils/cardID';
import { getCart } from '@/utils/getCart';
import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { CartItemType } from 'pages/api/cart';

export class CartStore {
  cart: CartItemType[] = [];
  cartID: string | undefined = '';
  isEmpty = true;
  // hasPhysicalGoods: boolean;

  // constructor() {
  //   makeObservable(this, {
  //     cartID: observable,
  //     cart: observable,
  //     setCart: action,
  //     setCartID: action,
  //     incrementProduct: action,
  //     decrementProduct: action,
  //     price: computed,
  //     hasPhysicalGoods: computed,
  //   });
  // }

  constructor() {
    makeAutoObservable(this);
  }

  get price() {
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
  };

  setNonEmpty = () => {
    this.isEmpty = false;
  };

  setEmpty = () => {
    this.isEmpty = true;
  };

  setCart = async (cartID: string): Promise<boolean> => {
    const gotCart = await getCart(cartID);

    runInAction(() => {
      this.cart = gotCart;
      this.isEmpty = gotCart.length > 0 ? false : true;
    });

    return !!gotCart;
  };

  incrementProduct = (index: number) => {
    this.cart[index].quantity = this.cart[index].quantity! + 1;
  };

  decrementProduct = (index: number) => {
    this.cart[index].quantity = this.cart[index].quantity! - 1;
  };

  get hasPhysicalGoods() {
    let hasPhysicalGoods = false;

    this.cart.forEach((item) => {
      if (item.category === 'Book2.0' || item.category === 'PrintBook') {
        hasPhysicalGoods = true;
      }
    });

    return hasPhysicalGoods;
  }
}

export const cartStore = new CartStore();
