import { NextApiRequest, NextApiResponse } from 'next';
import booksData from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book | null>,
) {
  const id = Number(req.query.id);
  res.status(200).json(booksData.find((book) => book.id === id) || null);
}
