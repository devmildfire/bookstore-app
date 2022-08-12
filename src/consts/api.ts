import { IS_DEV, PUBLIC_URL } from '@/consts/env';

export const PROTOCOL = IS_DEV ? 'http' : 'https';
export const BASE_API_URL = `${PROTOCOL}://${PUBLIC_URL}/api`;

export const TAGS = {
  BOOK: 'Book',
  BOOKS: 'Books',
  GIFTS: 'Gifts',
  SUBSCRIPTIONS: 'Subscription',
  SETS: 'Sets',
  SET: 'Set',
};
