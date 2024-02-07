import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import * as Styled from '../../src/components/CartPage/CartPage.styled';
import CartItem from '../../src/components/CartPage/CartItem/CartItem';
import Payment from '../../src/components/CartPage/Payment/Payment';
import backLinkArrow from '../../src/assets/icons/back-link-arrow.svg';
import ColumnLabels from '../../src/components/CartPage/ColumnLabels/ColumnLabels';

import { setOrGetCartCookie } from '@/utils/cardID';
import { Cart as CartType, CartItem as CartItemType } from '@/types/api';

interface Product {
  id: number;
  bookCover: string;
  title: string;
  author: string;
  edition: string;
  price: number;
  oldPrice?: number;
  quantity: number;
}

const cartProductsMock: Product[] = [
  {
    id: 1,
    bookCover: '/images/bookTitleDeleted.jpg',
    author: 'Катерина Кюне',
    edition: 'печатное',
    title: 'DELETED',
    price: 300,
    oldPrice: 350,
    quantity: 2,
  },
  {
    id: 2,
    bookCover: '/images/bookTitleDeleted.jpg',
    author: 'Катерина Кюне',
    edition: 'цифровое',
    title: 'DELETED',
    price: 300,
    quantity: 1,
  },
  {
    id: 3,
    bookCover: '/images/bookTitleDeleted.jpg',
    author: 'Катерина Кюне',
    edition: 'Книга2.0',
    title: 'DELETED',
    price: 300,
    quantity: 1,
  },
];

const BackIcon = styled(backLinkArrow)`
  margin-right: 5px;
  margin-top: 15px;
`;

const ReturnButton = styled.button`
  background-color: transparent;
  color: white;
  cursor: pointer;
`;

const calculateTotalPrice = (products: Product[]): number => {
  const result = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );
  return result;
};

enum productsActionKind {
  increment = 'increment',
  decriment = 'decriment',
  remove = 'remove',
}

type productsAction = {
  type: productsActionKind;
  productId: number;
};

function productsReducer(state: Product[], action: productsAction): Product[] {
  switch (action.type) {
    case productsActionKind.increment:
      return state.map((product) => {
        if (product.id === action.productId) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });
    case productsActionKind.decriment:
      return state.map((product) => {
        if (product.id === action.productId && product.quantity > 1) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });
    case productsActionKind.remove:
      return state.filter((product) => product.id !== action.productId);
    default:
      return state;
  }
}

const Cart = (): React.ReactElement => {
  const [products, dispatch] = useReducer(productsReducer, cartProductsMock);
  const [totalPrice, setTotalPrice] = useState(calculateTotalPrice(products));

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(products));
  }, [products]);

  function handleIncrementQuantity(productId: number) {
    dispatch({ type: productsActionKind.increment, productId });
  }

  function handleDecrimentQuantity(productId: number) {
    dispatch({ type: productsActionKind.decriment, productId });
  }

  function handleDelete(productId: number) {
    dispatch({ type: productsActionKind.remove, productId });
  }

  const productQuantity = products.reduce(
    (acc, product) => acc + product.quantity,
    0
  ) as number;

  return (
    <Styled.Main>
      <Styled.Title>Корзина</Styled.Title>
      <ColumnLabels />
      <Styled.ProductsList>
        {products.map((product) => (
          <CartItem
            key={product.id}
            {...product}
            handleDelete={() => handleDelete(product.id)}
            incrementQuantity={() => handleIncrementQuantity(product.id)}
            decrimentQuantity={() => handleDecrimentQuantity(product.id)}
          />
        ))}
      </Styled.ProductsList>
      <ReturnButton>
        <BackIcon />
        Вернуться назад
      </ReturnButton>
      <Payment quantity={productQuantity} price={totalPrice} />
    </Styled.Main>
  );
};

export default Cart;
