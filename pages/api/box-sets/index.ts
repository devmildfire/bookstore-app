import { NextApiRequest, NextApiResponse } from 'next';
import { BoxSet } from '@/models/boxSets';
import sets from '@/mocks/sets';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BoxSet[]>,
) {
  res.status(200).json(sets);
}
