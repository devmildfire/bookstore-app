import { NextApiRequest, NextApiResponse } from 'next';
import gifts from '@/mocks/gifts';
import { Gift } from '@/models/gifts';

export default function handler(_: NextApiRequest, res: NextApiResponse<Gift[]>): void {
  res.status(200).json(gifts);
}
