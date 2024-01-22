import { Author } from '@/types/author';
import { Product } from '@/types/product';

export type BookType = 'printedBook' | 'book2.0' | 'audioBook' | 'eBook';

export interface Title {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly thesis: string;
  readonly trailer: string;
  
  readonly ageRestriction: number;
  readonly cover?: string;
  readonly isFeatured: boolean;
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
  readonly list: Book[];
  readonly isLoading: boolean;
  readonly error: string | null;
}
