import getBase64 from '@/lib/getLocalBase64';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;

  let blur: string;
  let imageUrl: string;

  body.oper == 'getBlur' &&
    ((imageUrl = body.imageUrl),
    (blur = (await getBase64(imageUrl)) || ''),
    res.status(200).json(blur));
}
