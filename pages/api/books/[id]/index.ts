import { NextApiRequest, NextApiResponse } from 'next';
import { generateBook } from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book | null>
): void {
  const id = Number(req.query.id);
  const book: Book | null = id <= 150 ? generateBook(id) : null;
  res.status(200).json(book);
}
