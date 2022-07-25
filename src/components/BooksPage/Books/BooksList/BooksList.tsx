/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { Book, useGetBooksQuery } from '@/models/books';
import separateOnRow from '@/utils/separateOnRow';
import BookRow from './BookRow';
import { StyledIntersectingElement, StyledProductsList } from './styles';
import useInfinityQuery from '@/hooks/useInfinityQuery';

const BooksList: React.FC = () => {
  const { data: books = [], fetchNextPage } = useInfinityQuery(useGetBooksQuery);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const separatedBooks: Book[][] = separateOnRow(books, 3);

  React.useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(() => {
        fetchNextPage();
      });
      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [ref.current]);

  return (
    <StyledProductsList>
      {separatedBooks.map((row, i) => (
        /*  Нужно подумать, какой ключ дать */
        <BookRow books={row} key={row.length + i} />
      ))}
      <StyledIntersectingElement ref={ref} />
    </StyledProductsList>
  );
};

export default React.memo(BooksList);
