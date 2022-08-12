import * as React from 'react';
import Digital from '@/components/Common/Icons/Digital';
import Book2 from '@/components/Common/Icons/Book2';
import Book from '@/components/Common/Icons/Book';
import Audio from '@/components/Common/Icons/Audio';
import { BookType } from '@/models/books';
import { ClassNameProps } from '@/types/className';

export const bookTypeNameMap: Record<BookType, string> = {
  audio: 'АУДИОКНИГА',
  book2: 'КНИГА 2.0',
  digital: 'ЦИФРОВОЕ ИЗДАНИЕ',
  write: 'ПЕЧАТНОЕ ИЗДАНИЕ',
};
export const bookTypeIconMap: Record<BookType, React.ComponentType<ClassNameProps>> = {
  audio: Audio,
  book2: Book2,
  digital: Digital,
  write: Book,
};
