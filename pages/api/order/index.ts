import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { NextApiRequest, NextApiResponse } from 'next';
// import { Cart, CartItem } from '@/types/api';
import { Tables } from 'api/books/types';
import Robokaska from '@/utils/robokaska';
import { Link2Icon } from 'lucide-react';

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

async function getOrder(orderID: string): Promise<OrdersType | PostgrestError> {
  console.log('getting order id...', orderID);

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

async function getItems(
  orderID: string
): Promise<OrderItemType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('OrderItems')
    .select()
    .eq('order_id', orderID);

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

async function getLink(
  titleName: string,
  productType: string
): Promise<string | PostgrestError> {
  const title = await supabaseService
    .from('Titles')
    .select(
      `*, 
  CardBooks ( * ),
  Audiobooks ( * ),
  Ebooks ( * )  
  `
    )
    .eq('name', titleName)
    .single();

  if (title.data) {
    const link = title.data.Ebooks.src;
    return link;
  }

  if (title.error) {
    console.error(title.error);
  }

  return title.error || '';
}

async function getAllLinks(
  orderID: string
): Promise<string[] | PostgrestError> {
  const numOrder = parseInt(orderID);

  const orderItems = await supabaseService
    .from('OrderItems')
    .select()
    .eq('order_id', numOrder);

  console.log('order items data is ...', orderItems.data);

  if (!orderItems.data) {
    return orderItems.error;
  }

  const itemslinks: string[] = await Promise.all(
    orderItems.data.map(async (item) => {
      console.log('item type is...', item.type);

      if (item.type === 'Course') {
        const coursesData = await supabaseService
          .from('Courses')
          .select(`*`)
          .eq('name', item.name)
          .single();

        if (coursesData.data) {
          console.log('Courses are ...', coursesData.data);
          const link = coursesData.data.src;
          console.log(' course link is ...', link);
          return link;
        }
      }

      if (
        item.type === 'EBook' ||
        item.type === 'PrintBook' ||
        item.type === 'Book2.0'
        // ||
        // item.type === 'AudioBook'
      ) {
        const titleData = await supabaseService
          .from('Titles')
          .select(
            `*, 
          CardBooks ( * ),
          Audiobooks ( * ),
          Ebooks ( * )  
        `
          )
          .eq('name', item.name)
          .single();

        if (titleData.data) {
          console.log('Titles are ...', titleData.data);
          const link = titleData.data.Ebooks.src;
          console.log('link is ...', link);
          return link;
        }
      }

      if (item.type === 'AudioBook') {
        const titleData = await supabaseService
          .from('Titles')
          .select(
            `*, 
          Audiobooks ( * )
        `
          )
          .eq('name', item.name)
          .single();

        if (titleData.data) {
          console.log('Audio data is ...', titleData.data.Audiobooks);
          const link = titleData.data.Audiobooks.src;
          console.log('audio link is ...', link);
          return link;
        }
      }
    })
  );

  console.log('links are ...', itemslinks);

  return itemslinks;
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
  let titleName: string;
  let productType: string;

  let itemLink: string | PostgrestError;
  let itemsLinks: string[] | PostgrestError;

  let orderID: string;
  let sum: string;

  body.oper == 'fetch' &&
    ((cartID = body.cartID),
    (orderID = body.orderID),
    (singleOrder = await getOrder(orderID)),
    res.status(200).json(singleOrder));

  body.oper == 'fetchitems' &&
    ((orderID = body.orderID),
    (itemsListReturn = await getItems(orderID)),
    res.status(200).json(itemsListReturn));

  body.oper == 'fetchlink' &&
    ((titleName = body.titleName),
    (productType = body.productType),
    (itemLink = await getLink(titleName, productType)),
    res.status(200).json(itemLink));

  body.oper == 'fetchAllLinks' &&
    ((orderID = body.orderID),
    (itemsLinks = await getAllLinks(orderID)),
    res.status(200).json(itemsLinks));

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
