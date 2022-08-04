import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBook } from '@/mocks/books';
import { Book, GetBooksQuery } from '@/models/books';
import { generateItems } from '@/utils/generateItems';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book[]>,
): void {
  const {
    publishYear,
    count = 15,
    page = 1,
  } = req.query as unknown as GetBooksQuery;
  const hasPublishYear = !!Number(publishYear) && !!publishYear!.length;
  const books: Book[] = generateItems({
    generator: generateBook,
    pagination: {
      count,
      page,
    },
    isEnd: (id) => id > 150,
  }).filter(
    (book) =>
      !hasPublishYear
      || publishYear!.includes(new Date(book.publishDate).getFullYear().toString()),
  );
  res.status(200).json(books);
}
