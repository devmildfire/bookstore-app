import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { NextApiRequest, NextApiResponse } from 'next';
import { Cart, CartItem } from '@/types/api';
import { Tables } from 'api/books/types';

export type OrdersType = Tables<'Orders'>;
export type OrdersInsertType = Omit<OrdersType, 'id' | 'created_at'>;

export type OrderItemType = Tables<'OrderItems'>;
export type OrderItemInsertType = Omit<OrderItemType, 'id'>;

async function addOrder(
  order: OrdersInsertType
): Promise<OrdersType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Orders')
    .insert(order)
    .select();

  if (error) {
    console.error(error);
    return error;
  } else {
    // data && console.log('data is ...', JSON.stringify(data, null, 2));
    return data;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  console.log('body is', body);

  // const cartID: string = body.id ? body.id : '';
  // console.log('id is', cartID);

  let order: OrdersType[] | PostgrestError;
  let newOrder: OrdersInsertType;
  let item: CartItem;
  let errorMessage: string;

  let updatedItem: Cart | PostgrestError;

  // body.oper == 'fetch' &&
  //   ((cart = await getCart(cartID)), res.status(200).json(cart));

  body.oper == 'add' &&
    ((newOrder = body.order),
    (order = await addOrder(newOrder)),
    res.status(200).json(order));

  // body.oper == 'remove' &&
  //   ((item = body.item),
  //   (errorMessage = await removeItemFromCart(item)),
  //   res.status(200).json(errorMessage));

  // body.oper == 'update' &&
  //   ((item = body.item),
  //   (updatedItem = await updateItemInCart(item)),
  //   res.status(200).json(updatedItem));

  // body.oper == 'emptycart' &&
  //   (
  //     (errorMessage = await emptyCart(cartID)),
  //     (res.status(200).json(errorMessage))
  //   );
}
