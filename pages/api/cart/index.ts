import { PostgrestError } from '@supabase/supabase-js';
import { supabaseService } from 'api';
import { NextApiRequest, NextApiResponse } from 'next';
// import { Cart, CartItem } from '@/types/api';
import { Database, Tables } from 'api/books/types';

export type CartItemType = Database['public']['Tables']['Cart']['Row'];
export type CartItemInsertType = Database['public']['Tables']['Cart']['Insert'];

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
    // data && console.log('data is ...', JSON.stringify(data, null, 2));
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
    // data && console.log('data is ...', JSON.stringify(data, null, 2));
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

  !error &&
    console.log('DB item delete success ... ', JSON.stringify(error, null, 2));
  error &&
    console.log(
      'DB item delete update FAILED ... ',
      JSON.stringify(error, null, 2)
    );

  return JSON.stringify(error, null, 2);
}

async function emptyCart(cartID: string): Promise<string> {
  const { error } = await supabaseService
    .from('Cart')
    .delete()
    .eq('id', cartID);

  !error &&
    console.log('empty cart success ... ', JSON.stringify(error, null, 2));
  error &&
    console.log('empty cart FAILED ... ', JSON.stringify(error, null, 2));

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
  console.log('body is', body);

  const cartID: string = body.id ? body.id : '';
  console.log('id is', cartID);

  let cart: CartItemType[] | PostgrestError;
  let item: CartItemType;
  let errorMessage: string;

  let updatedItem: CartItemType[] | PostgrestError;

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
    ((errorMessage = await emptyCart(cartID)),
    res.status(200).json(errorMessage));
}
