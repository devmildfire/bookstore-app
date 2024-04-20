import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { PromoCodeType } from 'pages/api/cart';
import { getPromoCodeFromDB } from '@/utils/getPromoCode';
import { cartStore, CartStore } from './CartStore';

class PromoStore {
  codeEntered = false;
  showRules = false;
  rulesShown = false;
  promoCode: PromoCodeType | null = null;
  cartStore: CartStore;

  constructor(cartStore: CartStore) {
    this.cartStore = cartStore;
    makeObservable(this, {
      showRules: observable,
      rulesShown: observable,
      promoCode: observable,
      codeEntered: observable,
      setCode: action,
      codeDatesAreValid: computed,
      codeItemIsValid: computed,
      discountItemIndex: computed,
      codeDiscountIsValid: computed,
      codeIsValid: computed,
      cartFullPrice: computed,
      cartDiscountPrice: computed,
      cartPromoPrice: computed,
    });
  }

  get cartFullPrice() {
    let fullPrice = 0;
    this.cartStore.cart.forEach((product) => {
      fullPrice += Math.floor(product.price!) * product.quantity!;
    });
    return fullPrice;
  }

  get cartDiscountPrice() {
    const discountPrice = this.cartStore.cart.reduce(
      (acc, product) =>
        (acc +=
          Math.floor((product.price! * (100 - product.discount!)) / 100) *
          product.quantity!),
      0
    );

    return discountPrice;
  }

  get discountItemIndex() {
    if (!this.promoCode) {
      return null;
    }

    const cartItemsNames = this.cartStore.cart.map((item) => {
      return item.name + item.category;
    });

    const promoItemName =
      this.promoCode.product_name! + this.promoCode.product_type!;

    const promoItemInCartIndex = cartItemsNames.findIndex((x) => {
      return x === promoItemName;
    });

    return promoItemInCartIndex >= 0 ? promoItemInCartIndex : null;
  }

  get cartPromoPrice() {
    if (!this.promoCode || !this.codeIsValid) {
      return null;
    }

    if (this.promoCode.type === 'item' && !(this.discountItemIndex == null)) {
      const item = this.cartStore.cart[this.discountItemIndex];
      const itemDiscountPrice = Math.floor(
        (item.price! * (100 - item.discount!)) / 100
      );
      const itemPromoPrice = Math.floor(
        (item.price! * (100 - this.promoCode.discount!)) / 100
      );
      const priceDelta = (itemDiscountPrice - itemPromoPrice) * item.quantity!;

      const promoPrice = this.cartDiscountPrice - priceDelta;
      return promoPrice;
    }

    if (this.promoCode.type === 'cart') {
      const promoPrice = Math.floor(
        (this.cartFullPrice * (100 - this.promoCode.discount!)) / 100
      );
      return promoPrice;
    }

    return null;
  }

  get codeDatesAreValid() {
    if (!this.promoCode) {
      return false;
    }

    const currentDate = new Date();
    const promoStartDate = new Date(this.promoCode.start_date!);
    const promoEndDate = new Date(this.promoCode.end_date!);

    return currentDate >= promoStartDate && currentDate <= promoEndDate;
  }

  get codeItemIsValid() {
    if (!this.promoCode) {
      return false;
    }

    if (this.promoCode.type === 'cart') {
      return true;
    }

    const promoItemInCart = this.discountItemIndex == null ? false : true;

    return promoItemInCart;
  }

  get codeDiscountIsValid() {
    if (!this.promoCode) {
      return false;
    }

    if (this.promoCode.type === 'item') {
      if (this.codeItemIsValid && !(this.discountItemIndex == null)) {
        const cartSingleItemDiscount =
          this.cartStore.cart[this.discountItemIndex].discount;
        const promoItemDiscount = this.promoCode.discount;

        return promoItemDiscount! > cartSingleItemDiscount!;
      } else {
        return false;
      }
    }

    if (this.promoCode.type === 'cart') {
      const cartPriceWithPromo = Math.floor(
        (this.cartFullPrice * (100 - this.promoCode.discount!)) / 100
      );

      return cartPriceWithPromo! < this.cartDiscountPrice!;
    }
  }

  get codeIsValid() {
    return (
      this.codeDatesAreValid && this.codeItemIsValid && this.codeDiscountIsValid
    );
  }

  // setCode = (code: string): void => {
  //   runInAction(async () => {
  //     this.promoCode = await getPromoCodeFromDB({ setPromo, setError, code });
  //   });
  // };

  setCode = async (code: string) => {
    this.promoCode = await getPromoCodeFromDB(code);
  };

  setRules = (show: boolean) => {
    this.showRules = show;
  };
}

export const promoStore = new PromoStore(cartStore);
