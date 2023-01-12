import { Item } from './common';

export interface Product extends Item {
  readonly title: string;
  readonly transliteratedTitle?: string;
  readonly image?: string;
  readonly price: number;
  readonly newPrice?: number | null;
}
