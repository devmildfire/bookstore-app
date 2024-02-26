import React, { useCallback, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import * as Styled from '../../src/components/CartPage/CartPage.styled';
import CartItem from '../../src/components/CartPage/CartItem/CartItem';
import Payment from '../../src/components/CartPage/Payment/Payment';
import backLinkArrow from '../../src/assets/icons/back-link-arrow.svg';
import ColumnLabels from '../../src/components/CartPage/ColumnLabels/ColumnLabels';
import { setOrGetCartCookie } from '@/utils/cardID';
import { CartItemType } from 'pages/api/cart';
import { postData } from '@/utils/postData';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';

import Input from '@/components/Common/Input';

import { cartStore } from '@/store/CartStore';
import { observer } from 'mobx-react-lite';
import { promoStore } from '@/store/PromoStore';
import { Shipment } from '@/components/CartPage/Shipment/Shipment';

interface promoMessageProps {
  className: string;
}

const PromoMessage = observer(
  ({ className }: promoMessageProps): React.ReactElement => {
    let message = <div></div>;

    promoStore.promoCode === null &&
      !promoStore.codeEntered &&
      promoStore.showRules &&
      !promoStore.rulesShown &&
      (message = (
        <div className='shownDiv'>
          <h3>как работают промокоды:</h3>
          <div>- к заказу можно применить только один промокод</div>
          <div>
            - промокоды бывают двух видов: на какое-то одно издание и на всю
            корзину
          </div>
          <div>
            - если промокод применить для издания, у которого и так есть скидка,
            то действует только одна, наибольшая из двух скидок
          </div>
          <div>
            - если промокод применить для корзины, у товаров в которй и так есть
            скидки, то действует только одна, наибольшая из двух скидок: либо
            скидки всех отдельных изданий в корзине, либо скида по промокоду на
            всю корзину
          </div>
        </div>
      ));

    promoStore.promoCode === null &&
      promoStore.codeEntered &&
      (message = <div className='shownDiv'> Мы не знаем такого промокода</div>);

    if (promoStore.promoCode) {
      !promoStore.codeDiscountIsValid &&
        (message = (
          <div className='shownDiv'>
            Скидка по введённому промокоду меньше скидки, которая и так уже
            действует
          </div>
        ));

      !promoStore.codeItemIsValid &&
        (message = (
          <div className='shownDiv'>
            Продукта, для которого работает введённый промокод, нет в корзине
          </div>
        ));

      !promoStore.codeDatesAreValid &&
        (message = (
          <div className='shownDiv'>
            Период действия введённого промокода истёк либо ещё не начался
          </div>
        ));

      promoStore.codeIsValid &&
        (message = (
          <div className='shownDiv'>
            применён промокод {promoStore.promoCode.code}. Действует скидка{' '}
            {promoStore.promoCode.discount}% на
            {promoStore.promoCode.type === 'cart'
              ? ' всю корзину'
              : ' издание "' +
                promoStore.promoCode.product_name +
                '" - ' +
                promoStore.promoCode.product_type}
          </div>
        ));
    }

    return <div className={className}>{message}</div>;
  }
);

const slideDown = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  50% {
    transform: translateY(0%);
    opacity: 1;  
  }
  to {
    transform: translateY(0%);
    opacity: 1;
  }
`;

const StyledPromoMessage = styled(PromoMessage)`
  .shownDiv {
    animation: ${slideDown} 0.4s linear;

    /* background-color: var(--main-red-100); */
    background-color: #202020;
    padding: 20px;
    border-radius: 4px;
    text-align: center;

    div {
      text-align: left;
    }
  }
`;

const StyledText = styled(Text)`
  padding-bottom: 65px;

  @media ${breakPoints.xxl} {
    padding-bottom: 65px;
  }

  @media ${breakPoints.lg} {
    padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
    padding-bottom: 40px;
  }

  @media ${breakPoints.sm} {
    padding-bottom: 40px;
  }
`;

const BackIcon = styled(backLinkArrow)`
  margin-right: 5px;
  margin-top: 15px;
`;

const ReturnButton = styled.button`
  background-color: transparent;
  color: white;
  cursor: pointer;
`;

async function updateItemInDB(item: CartItemType, cartID: string) {
  const updatedItem: CartItemType = await postData(`/api/cart`, {
    oper: 'update',
    item: item,
  });
  console.log('updated item ... ', JSON.stringify(updatedItem, null, 2));
  cartID && cartStore.setCart(cartID);
}

async function removeItemFromDB(item: CartItemType, cartID: string) {
  const removedItem: CartItemType = await postData(`/api/cart`, {
    oper: 'remove',
    item: item,
  });
  console.log(
    'removed item from list ... ',
    JSON.stringify(removedItem, null, 2)
  );
  cartID && cartStore.setCart(cartID);
}

function EmptyCart() {
  return <div>В корзине пока ничего нет</div>;
}

interface fullCartProps {
  productQuantity: number;
  setStage: (stage: string) => void;
}

function FullCart({ productQuantity, setStage }: fullCartProps) {
  return (
    <>
      <ColumnLabels />
      <Styled.ProductsList>
        {cartStore.cart.map((product) => (
          <CartItem
            key={product.name + product.category}
            {...product}
            handleDelete={() => {
              removeItemFromDB(product, cartStore.cartID!);
            }}
            incrementQuantity={() => {
              updateItemInDB(
                {
                  ...product,
                  quantity: product.quantity! + 1,
                },
                cartStore.cartID!
              );
            }}
            decrimentQuantity={() => {
              updateItemInDB(
                {
                  ...product,
                  quantity: product.quantity! - 1,
                },
                cartStore.cartID!
              );
            }}
          />
        ))}
      </Styled.ProductsList>

      <StyledPromoMessage className='sdfsdfsdf' />

      <ReturnButton>
        <BackIcon />
        Вернуться назад
      </ReturnButton>

      <Payment
        setStage={setStage}
        quantity={productQuantity}
        price={cartStore.price}
        cart={cartStore.cart}
      />
    </>
  );
}

const Cart = observer((): React.ReactElement => {
  const [stage, setStage] = useState('cartStage');

  useEffect(() => {
    cartStore.cartID = setOrGetCartCookie()?.toString();
    if (cartStore.cartID) {
      cartStore.setCart(cartStore.cartID);
    }
  }, []);

  const productQuantity = cartStore.cart.reduce(
    (acc, product) => acc + product.quantity!,
    0
  ) as number;

  return (
    <Styled.Main>
      <StyledText textColor='white' variant='h2_1_Cart'>
        {stage === 'cartStage' ? 'Корзина' : 'Доставка'}
      </StyledText>

      {stage === 'cartStage' &&
        (cartStore.cart.length ? (
          <FullCart productQuantity={productQuantity} setStage={setStage} />
        ) : (
          <EmptyCart />
        ))}

      {stage === 'shipmentStage' && (
        <Shipment
          setStage={setStage}
          cartID={cartStore.cartID!}
          totalPrice={cartStore.price}
        />
      )}
    </Styled.Main>
  );
});

const StyledInput = styled(Input)`
  background-color: var(--main-white-20);
  border: none;
  color: var(--main-white-100);
  padding: 20px;
  max-width: var(--width);
  margin: 0 auto;
  width: 100%;

  @media ${breakPoints.lg} {
    width: 100%;
    height: 45px;
    max-width: 415px;
    padding: 0px 6px;
    /* padding: 0px 0px; */
    margin: 0 auto;
    font-size: 14px;
  }

  @media ${breakPoints.smd} {
    width: 100%;
    height: 32px;
    max-width: 239px;
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }

  @media ${breakPoints.sm} {
    width: 150px;
    height: 32px;
    max-width: var(--width);
    padding: 0px 6px;
    margin: 0 auto;
    font-size: 10px;
  }
`;

const ErrorOutput = styled.div`
  background-color: var(--main-red-20);
  color: var(--main-white-100);
  border: none;
  padding: 20px 0;
  margin: 0 auto;
  width: 879px;
  font-size: 16px;
  text-align: center;
  animation: ${slideDown} 0.2s linear;
  max-width: var(--width);
  border-radius: 2px;
  text-align: center;

  @media ${breakPoints.xl} {
    width: 879px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.lg} {
    width: 612px;
    height: 42px;
    line-height: 42px;
    margin: 0 auto;
    font-size: 12px;
    padding: 0 6px;
  }

  @media ${breakPoints.smd} {
    width: 400px;
    height: 32px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 32px;
  }

  @media ${breakPoints.sm} {
    width: 285px;
    margin: 0 auto;
    font-size: 8px;
    padding: 0 6px;
    line-height: 16px;
  }
`;

export default Cart;
