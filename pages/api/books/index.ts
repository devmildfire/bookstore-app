// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import booksData from '@/mocks/books';
import { Book } from '@/models/books';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book[]>,
) {
  res.status(200).json(booksData);
}
