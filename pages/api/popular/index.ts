import { NextApiRequest, NextApiResponse } from 'next';
import books from '@/mocks/books';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.json(books.slice(0, 5));
}
