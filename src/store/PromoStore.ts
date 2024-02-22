import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { PromoCodeType } from 'pages/api/cart';
import { getPromoCodeFromDB } from '@/utils/getPromoCode';

const setPromo = () => {
  console.log('function call for setPromo');
};

const setError = () => {
  console.log('function call for setError');
};

class PromoStore {
  promoCode: PromoCodeType | null = null;

  constructor() {
    makeObservable(this, {
      promoCode: observable,
      setCode: action,
      codeDatesAreValid: computed,
      codeItemIsValid: computed,
      codeDiscountIsValid: computed,
      codeIsValid: computed,
    });
  }

  get codeDatesAreValid() {
    console.log('Computing promo dates validity...');

    if (!this.promoCode) {
      return false;
    }

    const currentDate = new Date();
    const promoStartDate = new Date(this.promoCode.start_date!);
    const promoEndDate = new Date(this.promoCode.end_date!);

    return currentDate >= promoStartDate && currentDate <= promoEndDate;
  }

  get codeItemIsValid() {
    console.log('Computing promo item validity...');

    if (!this.promoCode) {
      return false;
    }

    // пока нет CartStore этот стор не может получить данные о состоянии корзины, с этим состояние можно проверять валидность "честно"
    return true;
  }

  get codeDiscountIsValid() {
    console.log('Computing promo discount amount validity...');

    if (!this.promoCode) {
      return false;
    }

    // пока нет CartStore этот стор не может получить данные о состоянии корзины, с этим состояние можно проверять валидность "честно"
    return true;
  }

  get codeIsValid() {
    console.log('Computing promo validity...');

    // пока нет CartStore этот стор не может получить данные о состоянии корзины, с этим состояние можно проверять валидность "честно"
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
    this.promoCode = await getPromoCodeFromDB({ setPromo, setError, code });
  };
}

export const promoStore = new PromoStore();
