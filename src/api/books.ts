import booksData from '@/mocks/books';
import mockServerResponse from '@/mocks/mockServerResponse';

export const load = async () => mockServerResponse(booksData);
