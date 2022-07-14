import { Author } from '@/types/author';
import { Product } from '@/types/product';

export interface Book extends Product {
  readonly authors: Author[];

  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;

  readonly banner: string;
  readonly trailerSrc: string;

  readonly description: string[];

  readonly symbolCount: number;
  readonly workers: Worker[];
  readonly formats: string[];
  readonly readers: Reader[];
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
