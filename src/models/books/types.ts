import { Author } from '@/types/author';
import { Product } from '@/types/product';
import { Tables } from 'api/books/types';

export type BookType = 'write' | 'book2' | 'audio' | 'digital';

// export enum BookTableTypesEnum {
//   PrintedBooks = 'PrintedBooks',
//   Ebooks = 'Ebooks',
//   Audiobooks = 'Audiobooks',
//   CardBooks = 'CardBooks',
// }

export enum BookTableTypesEnum {
  PrintedBooks = 'printedBook',
  Ebooks = 'eBook',
  Audiobooks = 'audioBook',
  CardBooks = 'cardBook',
}

export const bookTypes: BookTableTypesEnum[] = [
  BookTableTypesEnum.PrintedBooks,
  BookTableTypesEnum.Ebooks,
  BookTableTypesEnum.Audiobooks,
  BookTableTypesEnum.CardBooks,
];

type AudioBook = Tables<'Audiobooks'>;
type Ebook = Tables<'Ebooks'>;
type CardBook = Tables<'CardBooks'>;
type PrintBookCover = Tables<'PrintedCover'>;
type PrintedBookPrintSize = Tables<'PrintSize'>;

type PrintedBookOptions = Tables<'PrintOptions'> & {
  size: PrintedBookPrintSize[];
};

type PrintedBookType = Tables<'PrintedBooks'> & {
  options: PrintedBookOptions[];
  cover: PrintBookCover[];
};

export interface Title {
  readonly authors: Author[];
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly thesis: string;
  readonly trailer: string;
  readonly age_restriction: number;
  readonly cover: string;
  readonly slug: string;
  readonly is_featured: boolean;
  // readonly prices: Record<BookTableTypesEnum[number], number>[];
  readonly prices: number[];

  readonly discount: number[];
  readonly types: BookTableTypesEnum[];
  readonly PrintedBooks: PrintedBookType;
  readonly first_release: Date;
  Audiobooks: AudioBook;
  Ebooks: Ebook;
  CardBooks: CardBook;
}

export interface Book extends Product {
  readonly authors: Author[];

  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;

  readonly types: BookType[];

  readonly banner: string;
  readonly trailerSrc: string;
  // TODO: убрать опциональность для тезиса, должен быть у всех книг.
  readonly thesis?: string;
  readonly description: string[];

  readonly symbolCount: number;
  readonly workers: Worker[];
  readonly formats: string[];
  readonly readers: Reader[];

  // readonly awards: string[];
  // readonly ISBN: string;
}

export interface Worker {
  readonly place: string;
  readonly fullName: string;
}

export interface Reader {
  readonly name: string;
  readonly markets: ReaderMarket[];
}

export interface ReaderMarket {
  readonly name: string;
  readonly href: string;
}

export interface BooksState {
  readonly list: Title[];
  readonly isLoading: boolean;
  readonly error: string | null;
}
