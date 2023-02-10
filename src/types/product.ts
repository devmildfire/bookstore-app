import { Item } from './common';

export interface Product extends Item {
  readonly title: string;
  readonly transliteratedTitle?: string;
  readonly cover: string;
  readonly price: number;
  readonly newPrice?: number;
}
