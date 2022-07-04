import { Author } from '@/types/author';

const getAuthorNames = (authors: Author[]): string => authors.map((author) => author.name).join(', ');

export default getAuthorNames;
