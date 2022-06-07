export interface Book {
  readonly id: string;
  readonly title: string;
  readonly author: string | null;
  readonly authors: string[] | null;

  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;

  readonly price: number;
  readonly oldPrice: number | null;

  readonly link: string;
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
