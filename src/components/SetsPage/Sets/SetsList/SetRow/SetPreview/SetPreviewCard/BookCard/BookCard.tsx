import * as React from 'react';
import { Book } from '@/models/books';

interface BookCardProps
  extends Pick<Book, 'id' | 'authors' | 'title' | 'image'> {}

const BookCard: React.FC<BookCardProps> = (props) => {
  console.log(props);
  return null;
};

export default React.memo(BookCard);
