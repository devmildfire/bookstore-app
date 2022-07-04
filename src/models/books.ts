/* eslint-disable import/no-cycle */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Author } from '@/types/author';
import * as books from '@/api/books';
import { Store } from '.';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly authors: Author[];

  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;

  readonly price: number;
  readonly newPrice: number | null;

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

export interface BooksState {
  readonly list: Book[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: BooksState = {
  error: null,
  isLoading: false,
  list: [],
};

const store = createSlice({
  name: 'books',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadBooksThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadBooksThunk.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message || '';
      })
      .addCase(loadBooksThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload;
      });
  },
});

export const loadBooksThunk = createAsyncThunk('books/loadBooks', async () => {
  const response = await books.load();
  return response;
});

const selectBooksState = (state: Store): BooksState => state.books;

export const selectBooks = (state: Store): Book[] => selectBooksState(state).list;

export default store.reducer;
