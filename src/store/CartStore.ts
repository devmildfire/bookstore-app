import { Book } from '@/models/books';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { supabase } from 'api';

type CartItem = Book;

export class CartStore {
  cart: Array<CartItem> | null = null;

  constructor() {
    makeObservable(this, {
      cart: observable,
      setCart: action,
      addToCart: action,
    });
  }

  setCart = (item: CartItem): void => {
    runInAction(async () => {
      this.cart = await this.addToCart(item);
    });
  };

  addToCart = async (item: CartItem): Promise<Array<CartItem>> => {
    const { data, error } = await supabase.from('Cart').insert([item]).select();
    if (error) {
      throw new Error(error.message);
    }

    return data as Array<CartItem>;
  };
}
