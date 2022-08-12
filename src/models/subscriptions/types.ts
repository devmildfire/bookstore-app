import { Product } from '@/types/product';

export interface Subscription extends Product {
  readonly features: string[];
}
