import { CartItemType, PromoCodeType } from 'pages/api/cart';
import * as Styled from '../Payment/Payment.styled';
import { FormEvent, useEffect, useState } from 'react';
// import { postData } from '@/utils/postData';
import { PostgrestError } from '@supabase/supabase-js';
import { getPromoCodeFromDB } from '@/utils/getPromoCode';
import { promoStore } from '@/store/PromoStore';
import { observer } from 'mobx-react-lite';

const PromoView = observer(() => {
  return (
    <div>
      <p>
        {promoStore.codeEntered ? 'promo code is presented' : 'no promo code'}
      </p>

      {promoStore.codeEntered && (
        <>
          <pre>{JSON.stringify(promoStore.promoCode, null, 2)}</pre>
          <p>{promoStore.codeDatesAreValid && 'promo code dates are valid'}</p>
          <p>
            {promoStore.codeItemIsValid
              ? 'promo code item is valid'
              : 'promo code item is not in the cart'}
          </p>
          <p>
            {promoStore.codeDiscountIsValid
              ? 'promo code discount is valid'
              : 'item discount is bigger than promo code discount'}
          </p>
          <p>
            {promoStore.codeIsValid
              ? 'promo code is valid'
              : 'promo code is invalid'}
          </p>
          <p>
            {promoStore.codeIsValid &&
              `promo code adjusted price is ...  ${promoStore.cartPromoPrice}`}
          </p>
        </>
      )}
    </div>
  );
});

// const promoDateIsValid = (promo: PromoCodeType): boolean => {
//   const currentDateTime = new Date();
//   const promoStartDate = new Date(promo.start_date!);
//   const promoEndDate = new Date(promo.end_date!);

//   return currentDateTime >= promoStartDate && currentDateTime <= promoEndDate;
// };

// const promoItemIsValid = (
//   promo: PromoCodeType,
//   cart: CartItemType[]
// ): boolean => {
//   const cartItemsNames = cart.map((item) => {
//     return item.name + item.category;
//   });

//   const promoItemName = promo.product_name! + promo.product_type!;
//   const promoItemInCart = cartItemsNames.includes(promoItemName);

//   return promoItemInCart;
// };

// const promoDiscountDetails = (promo: PromoCodeType, cart: CartItemType[]) => {
//   const cartItemsNames = cart.map((item) => {
//     return item.name + item.category;
//   });
//   console.log('cartItemsNames are ... ', cartItemsNames);

//   const promoItemName = promo.product_name! + promo.product_type!;
//   console.log(promoItemName);

//   const promoItemInCartIndex = cartItemsNames.findIndex((x) => {
//     return x === promoItemName;
//   });

//   const cartSingleItemDiscount = cart[promoItemInCartIndex].discount;
//   const promoItemDiscount = promo.discount;

//   console.log(promoItemInCartIndex);

//   console.log('item index is ...', promoItemInCartIndex);

//   const getItemPriceDelta = (
//     cart: CartItemType[],
//     index: number,
//     discount: number
//   ) => {
//     const newPrice = Math.floor((cart[index].price! * (100 - discount)) / 100);
//     const oldPrice = Math.floor(
//       (cart[index].price! * (100 - cart[index].discount!)) / 100
//     );
//     const delta = (oldPrice - newPrice) * cart[index].quantity!;

//     return delta;
//   };

//   const delta = getItemPriceDelta(
//     cart,
//     promoItemInCartIndex,
//     promoItemDiscount!
//   );

//   return {
//     bigger: promoItemDiscount! > cartSingleItemDiscount!,
//     delta: delta,
//   };
// };

interface promoProps {
  cart: CartItemType[];
  price: number;
}

const Promocode = ({ cart, price }: promoProps): React.ReactElement => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const code = data.get('code') as string;
    console.log('promo submitted');
    console.log('code is ...', code);

    promoStore.setCode(code);
    promoStore.codeEntered = true;
  };

  return (
    <form onSubmit={onSubmit}>
      <Styled.Subtitle>Промокод</Styled.Subtitle>
      <Styled.Input
        name='code'
        placeholder='Введите промокод'
        type='text'
        maxLength={20}
      />
      <Styled.Button type='submit'>Применить</Styled.Button>

      <PromoView />
    </form>
  );
};

export default Promocode;
