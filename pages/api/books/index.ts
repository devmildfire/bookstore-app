import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBook } from '@/mocks/books';
import { Book, BookType, GetBooksQuery } from '@/models/books';
import { generateItems } from '@/utils/generateItems';

const hasFilter = (filter: string[] | 'null' | undefined): boolean => {
  return filter !== String(null) && !!filter!.length;
};
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Book[]>
): void {
  const {
    publishYear,
    productType,
    count = 15,
    page = 1,
  } = req.query as unknown as GetBooksQuery;
  /* TODO: сделать проверку на наличие фильтра с учетом null, как строки */
  const hasPublishYear = hasFilter(publishYear as any);
  const hasProductType = hasFilter(productType as any);

  const hasAnyFilters = hasPublishYear || hasProductType;
  const books: Book[] = generateItems({
    generator: generateBook,
    pagination: {
      count,
      page,
    },
    isEnd: (id) => id > 150,
  }).filter((book) => {
    let isValid = true;
    if (!hasAnyFilters) {
      return isValid;
    }

    if (hasPublishYear) {
      isValid = publishYear!.includes(
        new Date(book.publishDate).getFullYear().toString()
      );
    }

    if (hasProductType) {
      isValid = (productType! as Array<BookType>).some((selectedType) =>
        book.types.includes(selectedType));
    }

    return isValid;
  });
  res.status(200).json(books);
}
