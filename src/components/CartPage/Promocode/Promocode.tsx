import { CartItemType, PromoCodeType } from 'pages/api/cart';
import * as Styled from '../Payment/Payment.styled';
import { FormEvent, useEffect, useState } from 'react';
import { postData } from '@/utils/postData';
import { PostgrestError } from '@supabase/supabase-js';

const promoDateIsValid = (promo: PromoCodeType): boolean => {
  const currentDateTime = new Date();
  const promoStartDate = new Date(promo.start_date!);
  const promoEndDate = new Date(promo.end_date!);

  return currentDateTime >= promoStartDate && currentDateTime <= promoEndDate;
};

const promoItemIsValid = (
  promo: PromoCodeType,
  cart: CartItemType[]
): boolean => {
  const cartItemsNames = cart.map((item) => {
    return item.name + item.category;
  });

  const promoItemName = promo.product_name! + promo.product_type!;
  const promoItemInCart = cartItemsNames.includes(promoItemName);

  return promoItemInCart;
};

const promoDiscountDetails = (promo: PromoCodeType, cart: CartItemType[]) => {
  const cartItemsNames = cart.map((item) => {
    return item.name + item.category;
  });
  console.log('cartItemsNames are ... ', cartItemsNames);

  const promoItemName = promo.product_name! + promo.product_type!;
  console.log(promoItemName);

  const promoItemInCartIndex = cartItemsNames.findIndex((x) => {
    return x === promoItemName;
  });

  const cartSingleItemDiscount = cart[promoItemInCartIndex].discount;
  const promoItemDiscount = promo.discount;

  console.log(promoItemInCartIndex);

  console.log('item index is ...', promoItemInCartIndex);

  const getItemPriceDelta = (
    cart: CartItemType[],
    index: number,
    discount: number
  ) => {
    const newPrice = Math.floor((cart[index].price! * (100 - discount)) / 100);
    const oldPrice = Math.floor(
      (cart[index].price! * (100 - cart[index].discount!)) / 100
    );
    const delta = (oldPrice - newPrice) * cart[index].quantity!;

    return delta;
  };

  const delta = getItemPriceDelta(
    cart,
    promoItemInCartIndex,
    promoItemDiscount!
  );

  return {
    bigger: promoItemDiscount! > cartSingleItemDiscount!,
    delta: delta,
  };
};

interface getPromoProps {
  setPromo: (promo: PromoCodeType | null) => void;
  setError: (promo: PostgrestError | null) => void;

  code: string;
}

const getPromoCodeFromDB = async ({
  setPromo,
  setError,
  code,
}: getPromoProps) => {
  const promoCode: PromoCodeType | PostgrestError = await postData(
    `/api/cart`,
    {
      oper: 'getpromo',
      code: code,
    }
  );
  console.log(
    'got back promo code data... ',
    JSON.stringify(promoCode, null, 2)
  );

  if (!('message' in promoCode)) {
    setPromo(promoCode);
    setError(null);
  } else {
    setPromo(null);
    setError(promoCode);
  }
};

interface promoProps {
  cart: CartItemType[];
  price: number;
}

const Promocode = ({ cart, price }: promoProps): React.ReactElement => {
  const [code, setCode] = useState('');
  const [promo, setPromo] = useState<PromoCodeType | null>();
  const [error, setError] = useState<PostgrestError | null>();

  useEffect(() => {
    console.log('setting code ..');
    code && getPromoCodeFromDB({ setPromo, setError, code });
  }, [code]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const code = data.get('code') as string;
    console.log('promo submitted');
    console.log('code is ...', code);
    setCode(code);
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

      {promo &&
        (promoDateIsValid(promo) ? (
          <p> promocode dates are valid </p>
        ) : (
          <p> promocode dates are invalid </p>
        ))}

      {promo &&
        promo.type === 'item' &&
        promoDateIsValid(promo) &&
        (promoItemIsValid(promo, cart) ? (
          <p> promocode item is valid</p>
        ) : (
          <p> promocode item is not in the cart</p>
        ))}

      {promo &&
        promo.type === 'item' &&
        promoItemIsValid(promo, cart) &&
        (promoDiscountDetails(promo, cart).bigger ? (
          <>
            <p> promocode discount is bigger</p>
            <p>
              {' '}
              adjusted price is{' '}
              {price - promoDiscountDetails(promo, cart).delta}{' '}
            </p>
          </>
        ) : (
          <p> promocode discount is smaller</p>
        ))}

      <pre>{promo && JSON.stringify(promo, null, 2)}</pre>
      <pre>{error && JSON.stringify(error, null, 2)}</pre>
    </form>
  );
};

export default Promocode;
