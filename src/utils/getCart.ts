import { CartItemType } from 'pages/api/cart';
import { postData } from './postData';

export const getCart = async (cartID: string) => {
  const cartItems: CartItemType[] = await postData(`/api/cart`, {
    oper: 'fetch',
    id: cartID,
  });
  console.log(
    'fetched cart items list to store... ',
    JSON.stringify(cartItems, null, 2)
  );
  return cartItems;
};
