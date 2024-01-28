import books from '@/mocks/books';
import { Title } from '@/models/books';

const getBookInfo = (bookId: number | number[] | undefined): Title | null => {
  if (!bookId) {
    return null;
  }
  return (
    books.find(
      ({ id }) =>
        id === bookId || (Array.isArray(bookId) && bookId.includes(id))
    ) || null
  );
};

export default getBookInfo;
