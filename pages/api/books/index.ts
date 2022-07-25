import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBook } from '@/mocks/books';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Book } from '@/models/books';
import { Pagination } from '@/types/api';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book[]>,
) {
  const { count = 100, page = 1 } = req.query as unknown as Pagination;
  const books: Book[] = [];
  for (let id = count * (page - 1) + 1; id <= count * page; id += 1) {
    books.push(generateBook(id));
  }
  res.status(200).json(books);
}
