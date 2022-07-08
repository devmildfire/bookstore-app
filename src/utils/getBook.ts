import booksData from '@/mocks/books';
import { Book } from '@/models/books';

const getBookInfo = (bookId: number | number[] | undefined): Book | null => {
  if (!bookId) {
    return null;
  }
  return (
    booksData.find(
      ({ id }) =>
        id === bookId || (Array.isArray(bookId) && bookId.includes(id)),
    ) || null
  );
};

export default getBookInfo;
