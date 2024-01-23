import { Author } from '@/types/author';
import { Product } from '@/types/product';

export type BookType = 'write' | 'book2' | 'audio' | 'digital';

export interface Title {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly thesis: string;
  readonly trailer: string;

  readonly ageRestriction: number;
  readonly cover?: string;
  readonly isFeatured: boolean;
  readonly PrintedBooks: {
    id: number;
    pages: number;
    extra: string;
    lit_form: string;
    is_published: boolean;
    publish_date: string;
    release_date: string;
    price: number;
    discount: number;
    sold: number;
    title_id: number;
    options: {
      id: number;
      PrintedBookID: number;
      bindings: string;
      cover: string;
      paper: string;
      illustrations: string;
      size: {
        id: number;
        PrintOptionsID: number;
        width: number;
        height: number;
      }[];
    }[];
    cover: {
      id: number;
      PrintedBookID: number;
      source: string;
      shade: string;
      blurHash: string;
    }[];
  };
  Audiobooks: {
    id: number;
    duration: number;
    src: string;
    file_volume: number;
    extra: string;
    price: number;
    discount: number;
    sold: number;
    is_published: number;
    publish_date: string;
    release_date: string;
    title_id: number;
  };
  Ebooks: {
    id: number;
    src: string;
    file_volume: number;
    characters: number;
    extra: string;
    price: number;
    discount: number;
    sold: number;
    is_published: number;
    publish_date: string;
    release_date: string;
    title_id: number;
  };
  CardBooks: {
    id: number;
    extra: string;
    price: number;
    discount: number;
    sold: number;
    is_published: number;
    publish_date: string;
    release_date: string;
    title_id: number;
  };
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
