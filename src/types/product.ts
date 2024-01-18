import { Item } from './common';

export interface Product extends Item {
  readonly name: string;
  readonly transliteratedTitle?: string;
  readonly cover: string;
  readonly price: number;
  readonly newPrice?: number | null;
}
