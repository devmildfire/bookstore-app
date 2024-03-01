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
import { cartStore } from '@/store/CartStore';
import { observer } from 'mobx-react-lite';
import { Shipment } from '@/components/CartPage/Shipment/Shipment';
import { StyledPromoMessage } from '@/components/CartPage/PromoMessage/Message';
import { StyledButton } from '@/components/CartPage/styles';
import { useRouter } from 'next/router';

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

const StyledEmptyCart = styled(EmptyCart)`
  display: flex;
  flex-direction: column;

  button {
    margin-left: 0;
  }

  @media ${breakPoints.xxl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    button {
      margin-left: auto;
    }

    h2,
    p {
      text-align: center;
    }
  }
`;

function EmptyCart({ className }: { className: string }) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/books');
  };

  return (
    <div className={className}>
      <Text variant='h2c'>В корзине пока ничего нет</Text>

      <Text variant='text'>
        Вернитесь на главную или воспользуйтесь поиском, чтобы выбрать что-то
      </Text>
      <StyledButton type='button' onClick={handleClick}>
        Перейти на главную
      </StyledButton>
    </div>
  );
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
          <StyledEmptyCart className='emptyCart' />
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

export default Cart;
