import { NextApiRequest, NextApiResponse } from 'next';
import books from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<Book[]>,
) {
  res.json(books.slice(0, 5));
}
