import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { NextApiRequest, NextApiResponse } from 'next';
// import { Cart, CartItem } from '@/types/api';
import { Tables } from 'api/books/types';
import Robokaska from '@/utils/robokaska';

export type OrdersType = Tables<'Orders'>;
export type OrdersInsertType = Omit<OrdersType, 'id' | 'created_at'>;

export type OrderItemType = Tables<'OrderItems'>;
export type OrderItemInsertType = Omit<OrderItemType, 'id'>;

export type roboUrlProps = {
  invoiceID: number;
  email: string;
  outSum: string;
  invoiceDescription: string;
};

function generateRoboURL({
  invoiceID,
  email,
  outSum,
  invoiceDescription,
}: roboUrlProps) {
  const config = {
    shopIdentifier: process.env.NEXT_PUBLIC_SHOP_ID,
    password1: process.env.NEXT_PUBLIC_ROBOPASS_ONE,
    password2: process.env.NEXT_PUBLIC_ROBOPASS_TWO,
    testMode: true, // Указываем true, если работаем в тестовом режиме
  };

  const roboKassa = new Robokaska(config);

  // Вернёт строку с URL адресом, на который можно отправить пользователя
  const payURL = roboKassa.generateUrl(
    invoiceID,
    email,
    outSum,
    invoiceDescription
  );

  return payURL;
}

async function getOrder(
  cartID: string,
  orderID: string
): Promise<OrdersType | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Orders')
    .select('*')
    .eq('id', orderID)
    .single();
  // .eq('cart_id', cartID)

  if (error) {
    return error;
  } else {
    return data;
  }
}

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
    return data;
  }
}

async function addOrderItems(
  itemsList: OrderItemInsertType[]
): Promise<OrderItemType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('OrderItems')
    .insert(itemsList)
    .select();

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

async function makeOrderPaid(
  orderID: string
): Promise<OrdersType[] | PostgrestError> {
  const id: number = +orderID;

  const { data, error } = await supabaseService
    .from('Orders')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error(error);
    return error;
  } else {
    if (data.length > 0) {
      const paidOrderData = await supabaseService
        .from('Orders')
        .update({ status: 'paid' })
        .eq('id', id)
        .select();

      if (paidOrderData.error) {
        console.error(paidOrderData.error);
        return paidOrderData.error;
      } else {
        return paidOrderData.data;
      }
    } else {
      console.error('data is zero length. No such order');
      return data;
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;

  // const cartID: string = body.id ? body.id : '';

  let order: OrdersType[] | PostgrestError;
  let singleOrder: OrdersType | PostgrestError;

  let newOrder: OrdersInsertType;
  let itemsList: OrderItemInsertType[];
  let itemsListReturn: OrderItemType[] | PostgrestError;
  let urlProps: roboUrlProps;
  let returnUrl: string;
  let cartID: string;

  let orderID: string;
  let sum: string;

  body.oper == 'fetch' &&
    ((cartID = body.cartID),
    (orderID = body.orderID),
    (singleOrder = await getOrder(cartID, orderID)),
    res.status(200).json(singleOrder));

  body.oper == 'add' &&
    ((newOrder = body.order),
    (order = await addOrder(newOrder)),
    res.status(200).json(order));

  body.oper == 'additems' &&
    ((itemsList = body.items),
    (itemsListReturn = await addOrderItems(itemsList)),
    res.status(200).json(itemsListReturn));

  body.oper == 'payurl' &&
    ((urlProps = body.props),
    (returnUrl = generateRoboURL(urlProps)),
    res.status(200).json(returnUrl));

  body.oper == 'success' &&
    ((orderID = body.orderID),
    (sum = body.sum),
    makeOrderPaid(orderID),
    res.status(200).json({ order: orderID, sum: sum }));
}
