import { NextApiRequest, NextApiResponse } from 'next';
import { BoxSet } from '@/models/boxSets';
import { generateSet } from '@/mocks/sets';
import { Pagination } from '@/types/api';
import { generateItems } from '@/utils/generateItems';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BoxSet[]>
): void {
  const { count = 15, page = 1, } = req.query as Pagination;
  const sets: BoxSet[] = generateItems({
    generator: generateSet,
    pagination: {
      count,
      page,
    },
    isEnd: (id) => id > 50,
  });
  res.status(200).json(sets);
}
