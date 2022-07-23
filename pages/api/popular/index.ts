import { NextApiRequest, NextApiResponse } from 'next';
import booksData from '@/mocks/books';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.json(booksData.slice(0, 5));
}
