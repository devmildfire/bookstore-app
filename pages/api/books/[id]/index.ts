import { NextApiRequest, NextApiResponse } from 'next';
import books from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book | null>,
) {
  const id = Number(req.query.id);
  res.status(200).json(books.find((book) => book.id === id) || null);
}
