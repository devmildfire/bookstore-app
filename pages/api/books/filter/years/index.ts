import { NextApiRequest, NextApiResponse } from 'next';
import { years } from '@/mocks/years';

export default (_: NextApiRequest, res: NextApiResponse<string[]>): void => {
  res.json(years);
};
