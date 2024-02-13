import React, { useCallback, useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import * as Styled from '../../src/components/CartPage/CartPage.styled';
import CartItem from '../../src/components/CartPage/CartItem/CartItem';
import Payment from '../../src/components/CartPage/Payment/Payment';
import backLinkArrow from '../../src/assets/icons/back-link-arrow.svg';
import ColumnLabels from '../../src/components/CartPage/ColumnLabels/ColumnLabels';

import { setOrGetCartCookie } from '@/utils/cardID';
import { Cart as CartType, CartItem as CartItemType } from '@/types/api';
import { postData } from '@/utils/postData';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';

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

const calculateTotalPrice = (products: CartItemType[]): number => {
  const result = products.reduce((acc, product) => {
    const price = product.discount
      ? Math.floor(product.price * (1 - product.discount / 100))
      : product.price;
    return acc + price * product.quantity;
  }, 0);
  return result;
};

interface shipmentProps {
  setStage: (stage: string) => void;
}

function Shipment({ setStage }: shipmentProps): React.ReactElement {
  return (
    <div>
      Тут будет доставка
      <button
        onClick={() => {
          setStage('cartStage');
        }}
      >
        Вернуться
      </button>
    </div>
  );
}

const Cart = (): React.ReactElement => {
  const [totalPrice, setTotalPrice] = useState(0);

  const [cart, setCart] = useState<CartType>([]);
  const [cartID, setCartID] = useState('');
  const [stage, setStage] = useState('cartStage');

  useEffect(() => {
    const newCartID = setOrGetCartCookie()?.toString();

    if (newCartID) {
      setCartID(newCartID);
    }
  }, []);

  useEffect(() => {
    cartID && getCartFromDB(cartID);
  }, [cartID]);

  const getCartFromDB = useCallback(
    async (id: string) => {
      const cartItems: CartType = await postData(`/api/cart`, {
        oper: 'fetch',
        id: cartID,
      });
      console.log(
        'fetched cart items list ... ',
        JSON.stringify(cartItems, null, 2)
      );
      setCart([...cartItems]);
    },
    [cartID]
  );

  async function updateItemInDB(item: CartItemType) {
    const updatedItem: CartItemType = await postData(`/api/cart`, {
      oper: 'update',
      item: item,
    });
    console.log('updated item ... ', JSON.stringify(updatedItem, null, 2));
    cartID && getCartFromDB(cartID);
  }

  async function removeItemFromDB(item: CartItemType) {
    const removedItem: CartItemType = await postData(`/api/cart`, {
      oper: 'remove',
      item: item,
    });
    console.log(
      'removed item from list ... ',
      JSON.stringify(removedItem, null, 2)
    );
    cartID && getCartFromDB(cartID);
  }

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(cart));
  }, [cart]);

  const productQuantity = cart.reduce(
    (acc, product) => acc + product.quantity,
    0
  ) as number;

  function EmptyCart() {
    return <div>В корзине пока ничего нет</div>;
  }

  function FullCart() {
    return (
      <>
        <ColumnLabels />
        <Styled.ProductsList>
          {cart.map((product) => (
            <CartItem
              key={product.name + product.category}
              {...product}
              handleDelete={() => {
                removeItemFromDB(product);
              }}
              incrementQuantity={() => {
                updateItemInDB({
                  ...product,
                  quantity: product.quantity + 1,
                });
              }}
              decrimentQuantity={() => {
                updateItemInDB({
                  ...product,
                  quantity: product.quantity - 1,
                });
              }}
            />
          ))}
        </Styled.ProductsList>

        <ReturnButton>
          <BackIcon />
          Вернуться назад
        </ReturnButton>
        <Payment
          setStage={setStage}
          quantity={productQuantity}
          price={totalPrice}
        />
      </>
    );
  }

  // function CartID({ cartID }: { cartID: string }) {
  //   return <div> ID корзины: {cartID} </div>;
  // }

  // function CartItems({ cart }: { cart: CartType }) {
  //   return (
  //     <div>
  //       <div>cart contents</div>
  //       <pre>{JSON.stringify(cart, null, 2)}</pre>
  //     </div>
  //   );
  // }

  return (
    <Styled.Main>
      <StyledText textColor='white' variant='h2_1_Cart'>
        {stage === 'cartStage' ? 'Корзина' : 'Доставка'}
      </StyledText>

      {stage === 'cartStage' && (cart.length ? <FullCart /> : <EmptyCart />)}

      {stage === 'shipmentStage' && <Shipment setStage={setStage} />}
    </Styled.Main>
  );
};

export default Cart;
