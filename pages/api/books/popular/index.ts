import { NextApiRequest, NextApiResponse } from 'next';
import { generateItems } from '@/utils/generateItems';
import { generateBook } from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<Book[]>,
): void {
  const books: Book[] = generateItems({
    generator: generateBook,
    pagination: {
      count: 5,
      page: 1,
    },
  });
  res.json(books);
}
