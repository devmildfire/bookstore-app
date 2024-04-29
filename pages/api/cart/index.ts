import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { Database } from 'api/books/types';
import { NextApiRequest, NextApiResponse } from 'next';
// import { Cart, CartItem } from '@/types/api';

export type CartItemType = Database['public']['Tables']['Cart']['Row'];
export type CartItemInsertType = Database['public']['Tables']['Cart']['Insert'];
export type PromoCodeType = Database['public']['Tables']['Promocodes']['Row'];

async function getPromo(code: string): Promise<PromoCodeType | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Promocodes')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

async function getCart(id: string): Promise<CartItemType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Cart')
    .select('*')
    .eq('id', id)
    .order('name, category');

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

async function addItemToCart(
  item: CartItemType
): Promise<CartItemType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Cart')
    .insert(item)
    .select();

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

async function removeItemFromCart(item: CartItemType): Promise<string> {
  const { error } = await supabaseService
    .from('Cart')
    .delete()
    .eq('id', item.id)
    .eq('name', item.name)
    .eq('category', item.category);

  return JSON.stringify(error, null, 2);
}

async function emptyCart(cartID: string): Promise<string> {
  console.log('cart id for emptying in function is ... ', cartID);

  const { error } = await supabaseService
    .from('Cart')
    .delete()
    .eq('id', cartID);

  return JSON.stringify(error, null, 2);
}

async function updateItemInCart(
  item: CartItemType
): Promise<CartItemType[] | PostgrestError> {
  const { data, error } = await supabaseService
    .from('Cart')
    .upsert(item)
    .select();

  if (error) {
    console.error(error);
    return error;
  } else {
    return data;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;

  let cartID: string = body.id ? body.id : '';

  let cart: CartItemType[] | PostgrestError;
  let item: CartItemType;

  let promo: PromoCodeType | PostgrestError;
  let code: string;

  let errorMessage: string;

  let updatedItem: CartItemType[] | PostgrestError;

  body.oper == 'getpromo' &&
    ((code = body.code),
    (promo = await getPromo(code)),
    res.status(200).json(promo));

  body.oper == 'fetch' &&
    ((cart = await getCart(cartID)), res.status(200).json(cart));

  body.oper == 'add' &&
    ((item = body.item),
    (cart = await addItemToCart(item)),
    res.status(200).json(cart));

  body.oper == 'remove' &&
    ((item = body.item),
    (errorMessage = await removeItemFromCart(item)),
    res.status(200).json(errorMessage));

  body.oper == 'update' &&
    ((item = body.item),
    (updatedItem = await updateItemInCart(item)),
    res.status(200).json(updatedItem));

  body.oper == 'emptycart' &&
    ((cartID = body.id),
    console.log('cart id for empying is ... ', cartID),
    (errorMessage = await emptyCart(cartID)),
    res.status(200).json(errorMessage));
}
