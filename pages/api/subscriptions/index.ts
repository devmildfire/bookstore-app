import { NextApiRequest, NextApiResponse } from 'next';
import subscriptions from '@/mocks/subscriptions';

export default function handler(_: NextApiRequest, res: NextApiResponse): void {
  res.status(200).json(subscriptions);
}
