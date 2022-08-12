import { NextApiRequest, NextApiResponse } from 'next';
import { Author } from '@/types/author';
import { authors } from '@/mocks/authors';

export default (_: NextApiRequest, res: NextApiResponse<Author[]>): void => {
  res.json(authors);
};
