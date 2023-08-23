import React from 'react';
import * as Styled from './Payment.styled';
import PurchaseInfo from '../PurchaseInfo/PurchaseInfo';

const Payment = ({ quantity, price }: { quantity: number; price: number }): React.ReactElement => (
  <Styled.Container>
    <Styled.Subtitle>Промокод</Styled.Subtitle>
    <Styled.Input placeholder='Введите промокод' />
    <Styled.Button>Применить</Styled.Button>
    <PurchaseInfo text='Количество:' value={quantity} gridArea='quantity' />
    <PurchaseInfo text='Итоговая сумма:' value={price} gridArea='sum' />
    <Styled.CheckoutButton>Продолжить</Styled.CheckoutButton>
    <Styled.Instruction>
      После оплаты нажмите «Вернуться в магазин», чтобы скачать книгу.
    </Styled.Instruction>
  </Styled.Container>
);

export default Payment;
