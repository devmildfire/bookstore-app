import React, { useState } from 'react';
import * as Styled from './Payment.styled';
import PurchaseInfo from '../PurchaseInfo/PurchaseInfo';
import Robokaska from '@/utils/robokaska';
import { CartItemType } from 'pages/api/cart';
import Promocode from '../Promocode/Promocode';
import { promoStore } from '@/store/PromoStore';
import { observer } from 'mobx-react-lite';
import { cartStore } from '@/store/CartStore';
// import { CartItem } from '@/types/api';

interface roboUrlProps {
  invoiceID: number;
  email: string;
  outSum: string;
  invoiceDescription: string;
}

interface paymentProps {
  setStage: (stage: string) => void;
  quantity: number;
  price: number;
  cart: CartItemType[];
}

function generateRoboURL({
  invoiceID,
  email,
  outSum,
  invoiceDescription,
}: roboUrlProps) {
  const config = {
    shopIdentifier: process.env.NEXT_PUBLIC_SHOP_ID,
    password1: process.env.NEXT_PUBLIC_ROBOPASS_ONE,
    password2: process.env.NEXT_PUBLIC_ROBOPASS_TWO,
    testMode: true, // Указываем true, если работаем в тестовом режиме
  };

  const roboKassa = new Robokaska(config);

  // Вернёт строку с URL адресом, на который можно отправить пользователя
  const payURL = roboKassa.generateUrl(
    invoiceID,
    email,
    outSum,
    invoiceDescription
  );

  return payURL;
}

const Payment = observer(
  ({ setStage, quantity, price, cart }: paymentProps): React.ReactElement => {
    const [payURL, setPayURL] = useState('');

    return (
      <Styled.Container>
        <Promocode />

        <PurchaseInfo text='Количество:' value={quantity} gridArea='quantity' />
        <PurchaseInfo text='Итоговая сумма:' value={price} gridArea='sum' />

        {promoStore.cartPromoPrice && (
          <PurchaseInfo
            text='с учётом промокода:'
            value={promoStore.cartPromoPrice}
            gridArea='promoPrice'
          />
        )}

        <Styled.CheckoutButton
          onClick={() => {
            setStage('shipmentStage');
          }}
        >
          Продолжить
        </Styled.CheckoutButton>
        <Styled.Instruction>
          После оплаты нажмите «Вернуться в магазин», чтобы скачать книгу.
          { cartStore.hasPhysicalGoods && 'this cart contains physical items'}
        </Styled.Instruction>
      </Styled.Container>
    );
  }
);

export default Payment;
