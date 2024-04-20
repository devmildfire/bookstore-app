import { CartItemType } from 'pages/api/cart';
import { postData } from './postData';

export const getCart = async (cartID: string) => {
  const cartItems: CartItemType[] = await postData(`/api/cart`, {
    oper: 'fetch',
    id: cartID,
  });

  return cartItems;
};
