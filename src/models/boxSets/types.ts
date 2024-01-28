import { Product } from '@/types/product';
import { Title } from '../books';

export interface BoxSet extends Product {
  readonly books: Title[];
  readonly description: string;
}
