import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBook } from '@/mocks/books';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Book } from '@/models/books';
import { Pagination } from '@/types/api';
import { generateItems } from '@/utils/generateItems';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book[]>,
) {
  const { count = 15, page = 1 } = req.query as unknown as Pagination;
  const books: Book[] = generateItems({
    generator: generateBook,
    pagination: {
      count,
      page,
    },
    isEnd: (id) => id > 150,
  });
  res.status(200).json(books);
}
