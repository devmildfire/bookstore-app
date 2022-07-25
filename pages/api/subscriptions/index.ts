import { NextApiRequest, NextApiResponse } from 'next';
import subscriptions from '@/mocks/subscriptions';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(subscriptions);
}
