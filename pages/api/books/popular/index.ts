import { NextApiRequest, NextApiResponse } from 'next';
import { generateItems } from '@/utils/generateItems';
import { generateBook } from '@/mocks/books';
import { Title } from '@/models/books';

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<Title[]>
): void {
  const books: Title[] = generateItems({
    generator: generateBook,
    pagination: {
      count: 5,
      page: 1,
    },
  });
  res.json(books);
}
