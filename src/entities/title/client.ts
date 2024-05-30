import { BookTableTypesEnum } from '@/models/books/types';
import { IAuthor } from '../author/client';

export interface ITitlePhoto {
  id: number;
  source: string;
  blurHash: string | null;
  caption: string | null;
  titleId: number;
  category: string; // не просто строка, а категории. Нужно брать из enum
}

export interface ITitleAudiobook {
  id: number;
  duration: number;
  src: string;
  fileVolume: string;
  extra: string;
  price: number;
  discount: number;
  sold: number;
  isPublished: boolean;
  publishDate: string | null;
  releaseDate: string | null;
  titleId: number;
  counterColor: string;
  demo: string;
}

export interface ITitleEbook {
  id: number;
  src: string;
  fileVolume: number;
  characters: number;
  extra: string;
  price: number;
  discount: number;
  sold: number;
  isPublished: boolean;
  publishDate: string | null;
  releaseDate: string | null;
  titleId: number;
  ISBN: string;
  counterColor: string;
  demo: string | null;
}

export interface IPrintedBookSize {
  id: number;
  PrintOptionsID: number;
  width: number;
  height: number;
}

export interface IPrintedBookOptions {
  id: number;
  PrintedBookID: number;
  bindings: string;
  cover: string;
  paper: string;
  illustrations: string;
  size: IPrintedBookSize[];
}

export interface ITitleCover {
  id: number;
  PrintedBookID: number;
  source: string;
  shade: string;
  blurHash: string;
}

export interface ITitlePrintedBook {
  id: number;
  pages: number;
  extra: string;
  isPublished: boolean;
  publishDate: string | null;
  releaseDate: string | null;
  price: number;
  discount: number;
  sold: number;
  titleId: number;
  ISBN: string;
  counterColor: string;
  demo: string | null;
  soldOut: boolean;
  options: IPrintedBookOptions[];
  cover: ITitleCover[];
}

export interface ITitleAward {
  id: number;
  awardId: number;
  titleId: number;
  title: string;
  source: string;
}

export interface ITitleCardBook {
  id: number;
  extra: string;
  price: number;
  discount: number;
  sold: number;
  isPublished: boolean;
  publishDate: string | null;
  releaseDate: string | null;
  titleId: number;
  demo: string | null;
  counterColor: string;
  soldOut: boolean;
}

export interface ITitleNovel {
  titleId: number;
  name: string;
}

export interface ITitle {
  id: number;
  description: string;
  thesis: string;
  trailer: string;

  trailerPoster: string;
  litForm: string;
  isCompilation: boolean;

  ageRestriction: number;
  name: string;
  cover: string;
  slug: string;
  isFeatured: boolean;
  firstRelease: string;
  demo: string;
  authors: IAuthor[];
  Photos: ITitlePhoto[];
  cardBook: ITitleCardBook | null;
  audioBook: ITitleAudiobook | null;
  eBook: ITitleEbook | null;
  printedBook: ITitlePrintedBook | null;
  awards: ITitleAward[];
  novels: ITitleNovel[];
}
