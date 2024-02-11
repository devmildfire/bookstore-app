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

interface Product {
  titleId: number;
  category: string;
  bookCover: string;
  title: string;
  author: string;
  price: number;
  oldPrice?: number;
  quantity: number;
}

// const readableCategories = {
//   PrintBook: 'печатное издание',
//   AudioBook: 'аудиокнига',
//   EBook: 'электронное издание',
//   'Book2.0': 'книга 2.0',
//   GiftCard: 'карта даров',
//   BoxSet: 'бокс сет',
//   Subscription: 'подписка',
//   Course: 'курс',
// };

// const cartProductsMock: Product[] = [
//   {
//     id: 1,
//     bookCover: '/images/bookTitleDeleted.jpg',
//     author: 'Катерина Кюне',
//     edition: 'печатное',
//     title: 'DELETED',
//     price: 300,
//     oldPrice: 350,
//     quantity: 2,
//   },
//   {
//     id: 2,
//     bookCover: '/images/bookTitleDeleted.jpg',
//     author: 'Катерина Кюне',
//     edition: 'цифровое',
//     title: 'DELETED',
//     price: 300,
//     quantity: 1,
//   },
//   {
//     id: 3,
//     bookCover: '/images/bookTitleDeleted.jpg',
//     author: 'Катерина Кюне',
//     edition: 'Книга2.0',
//     title: 'DELETED',
//     price: 300,
//     quantity: 1,
//   },
// ];

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
      ? product.price * (1 - product.discount / 100)
      : product.price;
    return acc + price * product.quantity;
  }, 0);
  return result;
};

enum productsActionKind {
  increment = 'increment',
  decriment = 'decriment',
  remove = 'remove',
}

type productsAction = {
  type: productsActionKind;
  titleId: number;
  category: string;
};

function productsReducer(state: Product[], action: productsAction): Product[] {
  switch (action.type) {
    case productsActionKind.increment:
      return state.map((product) => {
        if (
          product.titleId === action.titleId &&
          product.category === action.category
        ) {
          return { ...product, quantity: product.quantity + 1 };
        }
        return product;
      });
    case productsActionKind.decriment:
      return state.map((product) => {
        if (
          product.titleId === action.titleId &&
          product.category === action.category &&
          product.quantity > 1
        ) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });
    case productsActionKind.remove:
      return state.filter(
        (product) =>
          product.titleId !== action.titleId ||
          product.category !== action.category
      );
    default:
      return state;
  }
}

const Cart = (): React.ReactElement => {
  // const [products, dispatch] = useReducer(productsReducer, cartProductsMock);
  // const [totalPrice, setTotalPrice] = useState(calculateTotalPrice(products));
  const [totalPrice, setTotalPrice] = useState(0);

  const [cart, setCart] = useState<CartType>([]);
  const [cartID, setCartID] = useState('');

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

  // function findItemIndex(name: string, category: string): number {
  //   const index = cart.findIndex(
  //     (item) => item?.name == name && item?.category == category
  //   );
  //   return index;
  // }

  // function updateCart(updatedItem: CartItemType) {
  //   const index = findItemIndex(updatedItem.name, updatedItem.category);

  //   let list = [...cart];

  //   index == -1 &&
  //     (setCart([...cart.filter((item) => item.quantity !== 0), updatedItem]),
  //     addItemToDB(updatedItem));

  //   index !== -1 &&
  //     ((list[index] = updatedItem),
  //     (list = list.filter((item) => item.quantity !== 0)),
  //     setCart([...list]),
  //     updatedItem.quantity == 0
  //       ? removeItemFromDB(updatedItem)
  //       : updateItemInDB(updatedItem));
  // }

  async function updateItemInDB(item: CartItemType) {
    const updatedItem: CartItemType = await postData(`/api/cart`, {
      oper: 'update',
      item: item,
    });
    console.log('updated item ... ', JSON.stringify(updatedItem, null, 2));
    cartID && getCartFromDB(cartID);
  }

  // async function addItemToDB(item: CartItemType) {
  //   const addedItem: CartItemType = await postData(`/api/cart`, {
  //     oper: 'add',
  //     item: item,
  //   });
  //   console.log('added item to list ... ', JSON.stringify(addedItem, null, 2));
  //   cartID && getCartFromDB(cartID);
  // }

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

  // function handleIncrementQuantity(productId: number) {
  //   dispatch({ type: productsActionKind.increment, productId });
  // }

  // function handleDecrimentQuantity(productId: number) {
  //   dispatch({ type: productsActionKind.decriment, productId });
  // }

  // function handleDelete(productId: number) {
  //   dispatch({ type: productsActionKind.remove, productId });
  // }

  const productQuantity = cart.reduce(
    (acc, product) => acc + product.quantity,
    0
  ) as number;

  function CartID({ cartID }: { cartID: string }) {
    return <div> ID корзины: {cartID} </div>;
  }

  function CartItems({ cart }: { cart: CartType }) {
    return (
      <div>
        <div>cart contents</div>
        <pre>{JSON.stringify(cart, null, 2)}</pre>
      </div>
    );
  }

  return (
    <Styled.Main>
      <Styled.Title>Корзина</Styled.Title>

      <CartID cartID={cartID} />
      <CartItems cart={cart} />

      <ColumnLabels />
      <Styled.ProductsList>
        {cart.map((product) => (
          <CartItem
            key={product.id}
            {...product}
            handleDelete={() => {
              removeItemFromDB(product);
            }}
            incrementQuantity={() => {
              updateItemInDB({ ...product, quantity: product.quantity + 1 });
            }}
            decrimentQuantity={() => {
              updateItemInDB({ ...product, quantity: product.quantity - 1 });
            }}
          />
        ))}
      </Styled.ProductsList>
      {/* <Styled.ProductsList>
        {cart.map((product) => (
          <CartItem
            key={product.id}
            {...product}
            handleDelete={() => handleDelete(product.id)}
            incrementQuantity={() => handleIncrementQuantity(product.id)}
            decrimentQuantity={() => handleDecrimentQuantity(product.id)}
          />
        ))}
      </Styled.ProductsList> */}
      <ReturnButton>
        <BackIcon />
        Вернуться назад
      </ReturnButton>
      <Payment quantity={productQuantity} price={totalPrice} />
    </Styled.Main>
  );
};

export default Cart;
