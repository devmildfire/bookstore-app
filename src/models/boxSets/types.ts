import { Product } from '@/types/product';
import { Book } from '../books';

export interface BoxSet extends Product {
  readonly books: Book[];
  readonly description: string;
}
