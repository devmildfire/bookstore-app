import getBase64 from '@/lib/getLocalBase64';
import { NextApiRequest, NextApiResponse } from 'next';

// async function getPromo(code: string): Promise<PromoCodeType | PostgrestError> {
//   const { data, error } = await supabaseService
//     .from('Promocodes')
//     .select('*')
//     .eq('code', code)
//     .single();

//   if (error) {
//     console.error(error);
//     return error;
//   } else {
//     return data;
//   }
// }

// async function getCart(id: string): Promise<CartItemType[] | PostgrestError> {
//   const { data, error } = await supabaseService
//     .from('Cart')
//     .select('*')
//     .eq('id', id)
//     .order('name, category');

//   if (error) {
//     console.error(error);
//     return error;
//   } else {
//     return data;
//   }
// }

// async function addItemToCart(
//   item: CartItemType
// ): Promise<CartItemType[] | PostgrestError> {
//   const { data, error } = await supabaseService
//     .from('Cart')
//     .insert(item)
//     .select();

//   if (error) {
//     console.error(error);
//     return error;
//   } else {
//     return data;
//   }
// }

// async function removeItemFromCart(item: CartItemType): Promise<string> {
//   const { error } = await supabaseService
//     .from('Cart')
//     .delete()
//     .eq('id', item.id)
//     .eq('name', item.name)
//     .eq('category', item.category);

//   return JSON.stringify(error, null, 2);
// }

// async function emptyCart(cartID: string): Promise<string> {
//   console.log('cart id for emptying in function is ... ', cartID);

//   const { error } = await supabaseService
//     .from('Cart')
//     .delete()
//     .eq('id', cartID);

//   return JSON.stringify(error, null, 2);
// }

// async function updateItemInCart(
//   item: CartItemType
// ): Promise<CartItemType[] | PostgrestError> {
//   const { data, error } = await supabaseService
//     .from('Cart')
//     .upsert(item)
//     .select();

//   if (error) {
//     console.error(error);
//     return error;
//   } else {
//     return data;
//   }
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;

  let blur: string;

  // let cartID: string = body.id ? body.id : '';

  // let cart: CartItemType[] | PostgrestError;
  // let item: CartItemType;

  // let promo: PromoCodeType | PostgrestError;
  // let code: string;

  // let errorMessage: string;

  // let updatedItem: CartItemType[] | PostgrestError;

  // body.oper == 'getpromo' &&
  //   ((code = body.code),
  //   (promo = await getPromo(code)),
  //   res.status(200).json(promo));

  body.oper == 'getBlur' &&
    ((blur =
      (await getBase64(
        'https://api.mi59173.tw1.ru/storage/v1/object/public/titles/title_titles_Belyj-cvetok.jpg'
      )) || ''),
    res.status(200).json(blur));

  // body.oper == 'add' &&
  //   ((item = body.item),
  //   (cart = await addItemToCart(item)),
  //   res.status(200).json(cart));

  // body.oper == 'remove' &&
  //   ((item = body.item),
  //   (errorMessage = await removeItemFromCart(item)),
  //   res.status(200).json(errorMessage));

  // body.oper == 'update' &&
  //   ((item = body.item),
  //   (updatedItem = await updateItemInCart(item)),
  //   res.status(200).json(updatedItem));

  // body.oper == 'emptycart' &&
  //   ((cartID = body.id),
  //   console.log('cart id for empying is ... ', cartID),
  //   (errorMessage = await emptyCart(cartID)),
  //   res.status(200).json(errorMessage));
}
