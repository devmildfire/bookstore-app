import booksData from './booksData';
import { BooksData } from '@/types/api';

const getBookInfo = (id: string | string[] | undefined): BooksData | null => {
  let bookInfo = null;
  booksData.forEach((el) => {
    if (id === el.id) {
      bookInfo = el;
    }
  });
  return bookInfo;
};

export default getBookInfo;
