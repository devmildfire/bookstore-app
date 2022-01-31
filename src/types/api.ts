export interface BooksData {
  id: string;
  title: string;
  author: string | null;
  authors: string[] | null;
  yearOfPublication: number;
  genre: string;
  ageRestriction: string ;
  price: number;
  oldPrice: number | null;
  link: string;
  banner: string;
  description: string[];
}
