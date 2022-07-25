import { NextApiRequest, NextApiResponse } from 'next';
import gifts from '@/mocks/gifts';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(gifts);
}
