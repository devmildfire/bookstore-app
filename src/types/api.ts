export interface Pagination {
  readonly page?: number;
  readonly count?: number;
}

export type CartItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  summ: number;
  price: number;
  discount: number;
};

export type Cart = CartItem[];
