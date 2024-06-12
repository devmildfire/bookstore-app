import React, { useState } from 'react';
import * as Styled from './Payment.styled';
import PurchaseInfo from '../PurchaseInfo/PurchaseInfo';
import { CartItemType } from 'pages/api/cart';
import Promocode from '../Promocode/Promocode';
import { promoStore } from '@/store/PromoStore';
import { observer } from 'mobx-react-lite';
import { cartStore } from '@/store/CartStore';

interface paymentProps {
  setStage: (stage: string) => void;
  quantity: number;
  price: number;
  cart: CartItemType[];
}

const Payment = observer(
  ({ setStage, quantity, price, cart }: paymentProps): React.ReactElement => {
    const [payURL, setPayURL] = useState('');

    return (
      <Styled.Container>
        <Promocode />

        <div>
          <PurchaseInfo
            text='Количество:'
            value={quantity}
            gridArea='quantity'
            isCurrencyAmount={false}
          />
          <PurchaseInfo
            text='Итоговая сумма:'
            value={price}
            gridArea='sum'
            isCurrencyAmount={true}
          />

          {promoStore.cartPromoPrice && (
            <PurchaseInfo
              text='с учётом промокода:'
              value={promoStore.cartPromoPrice}
              gridArea='promoPrice'
              isCurrencyAmount={true}
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
            После оплаты нажмите «Вернуться в магазин».
          </Styled.Instruction>
        </div>
      </Styled.Container>
    );
  }
);

export default Payment;
