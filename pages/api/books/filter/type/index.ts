import { NextApiRequest, NextApiResponse } from 'next';
import { types } from '@/mocks/type';

export default (_: NextApiRequest, res: NextApiResponse): void => {
  res.json(types);
};
