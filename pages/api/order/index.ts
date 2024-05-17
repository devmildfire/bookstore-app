import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { NextApiRequest, NextApiResponse } from 'next';
import { Tables } from 'api/books/types';
import Robokaska from '@/utils/robokaska';
import { postData } from '@/utils/postData';

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

export type LinkReturnType = {
  url: string;
  name: string;
};

function generateRoboURL({
  invoiceID,
  email,
  outSum,
  invoiceDescription,
}: roboUrlProps) {
  const config = {
    shopIdentifier: process.env.SHOP_ID,
    password1: process.env.ROBOPASS_ONE,
    password2: process.env.ROBOPASS_TWO,
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

function checkOrder(invId: number, outSum: number, signatureValue: string) {
  const config = {
    shopIdentifier: process.env.SHOP_ID,
    password1: process.env.ROBOPASS_ONE,
    password2: process.env.ROBOPASS_TWO,
    testMode: true, // Указываем true, если работаем в тестовом режиме
  };

  const roboKassa = new Robokaska(config);

  const isValid = roboKassa.checkPay(invId, outSum, signatureValue);
  console.log('checking order... ', invId);
  console.log('with sum... ', outSum);
  console.log('and value... ', signatureValue);

  console.log('order is valid... ', isValid);

  return isValid;
}

async function emptyCartFromDB(cartID: string): Promise<string> {
  const emptyCartResponse: string = await postData(`/api/cart`, {
    oper: 'emptycart',
    id: cartID,
  });
  return emptyCartResponse;
}

async function getOrder(orderID: string): Promise<OrdersType | PostgrestError> {
  // console.log('getting order id...', orderID);

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
): Promise<(LinkReturnType | undefined)[] | PostgrestError> {
  const numOrder = parseInt(orderID);

  const orderItems = await supabaseService
    .from('OrderItems')
    .select()
    .eq('order_id', numOrder);

  // console.log('order items data is ...', orderItems.data);

  if (!orderItems.data) {
    return orderItems.error;
  }

  const itemslinks: (LinkReturnType | undefined)[] = await Promise.all(
    orderItems.data.map(async (item) => {
      // console.log('item type is...', item.type);

      if (item.type === 'Course') {
        const coursesData = await supabaseService
          .from('Courses')
          .select(`*`)
          .eq('name', item.name)
          .single();

        if (coursesData.data) {
          // console.log('Courses are ...', coursesData.data);
          const link = coursesData.data.src as string;
          const courseName = (coursesData.data.name + ` — Курс`) as string;
          // console.log(' course name is ...', courseName);
          // console.log(' course link is ...', link);

          return {
            url: link,
            name: courseName,
          };
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
          // console.log('Titles are ...', titleData.data);
          const bookName = `${item.name} — ${item.type}` as string;
          const link = titleData.data.Ebooks.src as string;
          // console.log('link is ...', link);
          // return link;

          return {
            url: link,
            name: bookName,
          };
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
          // console.log('Audio data is ...', titleData.data.Audiobooks);
          const link = titleData.data.Audiobooks.src as string;
          const audioBookName = `${item.name} — ${item.type}` as string;
          // console.log('audio link is ...', link);
          return {
            url: link,
            name: audioBookName,
          };
        }
      }
    })
  );

  // console.log('links are ...', itemslinks);

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

async function alertCheck(order: string): Promise<boolean> {
  const { data, error } = await supabaseService
    .from('Orders')
    .select('*')
    .eq('id', order)
    .single();

  if (data.alerts_sent) {
    console.log('alerts allready sent');
    return true;
  }

  console.log('alerts NOT sent');
  return false;
}

async function setAlertsSent(order: string) {
  const { data, error } = await supabaseService
    .from('Orders')
    .update({
      alerts_sent: true,
    })
    .eq('id', order)
    .select()
    .single();

  if (data) {
    console.log('alerts sent status changed to TRUE');
  }

  console.log('alerts sent status NOT changed');
}

async function telegramAlert(
  email: string,
  order: string,
  details: string
): Promise<Response> {
  const token = process.env.TELEGRAM_BOT_APIKEY as string;
  const chatID = process.env.TELEGRAM_BOT_CHAT_ID as string;

  console.log('sending alert to telegram chat ... ', chatID);

  const url = `https://api.telegram.org/bot${token}/sendMessage`; // The url to request
  const text = `Кто-то с электронной почтой ${email} сделал заказ ${order}. Детали заказа ${details}`;

  console.log('trying to send message with token: ', token);
  console.log('url: ', url);
  console.log('trying to send message to Telegram chat id: ', chatID);

  const obj = {
    chat_id: chatID, // Telegram chat id
    text: text, // The text to send
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return res;
}

async function emailAlert(email: string, order: string, details: string) {
  console.log('sending alert to email ... ', email);

  const apiKey = process.env.BREVO_APIKEY as string;

  const emailAlertResponse = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Tester Mildfire',
          email: 'noreply@chtivo.spb.ru',
        },
        to: [
          {
            email: 'info@chtivo.spb.ru',
            name: 'Mildfire',
          },
        ],
        subject: 'Hello Test',
        htmlContent: `Кто-то с электронной почтой ${email} сделал заказ ${order}. Детали заказа ${details}`,
      }),
    }
  );
  return emailAlertResponse;
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
        .select()
        .single();

      if (paidOrderData.error) {
        console.error(paidOrderData.error);
        return paidOrderData.error;
      } else {
        const alertsSent = await alertCheck(paidOrderData.data.id);

        console.log('alerts sent status is ... ', alertsSent);

        if (alertsSent === false) {
          console.log('sending alerts');

          const response = await emailAlert(
            paidOrderData.data.email,
            paidOrderData.data.id,
            `https://mi59173.tw1.ru/dashboard/orders/${paidOrderData.data.id}`
          );
          const teleResponse = await telegramAlert(
            paidOrderData.data.email,
            paidOrderData.data.id,
            `https://mi59173.tw1.ru/dashboard/orders/${paidOrderData.data.id}`
          );

          console.log('telegram response is ...', teleResponse);

          setAlertsSent(paidOrderData.data.id);

          emptyCartFromDB(paidOrderData.data.cart_id);
        } else {
          console.log('alerts ARE sent, doing nothing!');
        }

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
  let itemsLinks: (LinkReturnType | undefined)[] | PostgrestError;

  let orderID: string;
  let orderIsValid: boolean;
  let sum: string;

  let signatureValue: string;

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

  body.InvId &&
    body.OutSum &&
    body.SignatureValue &&
    ((orderID = body.InvId),
    (sum = body.OutSum),
    (signatureValue = body.SignatureValue),
    (orderIsValid = checkOrder(parseInt(orderID), +sum, signatureValue)),
    orderIsValid && makeOrderPaid(orderID),
    res.status(200).json({ status: 'OK', order: orderID, sum: sum }));
}
