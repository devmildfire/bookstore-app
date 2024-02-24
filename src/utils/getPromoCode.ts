import { PostgrestError } from '@supabase/supabase-js';
import { PromoCodeType } from 'pages/api/cart';
import { postData } from '@/utils/postData';

export const getPromoCodeFromDB = async (code: string) => {
  const promoCode: PromoCodeType | PostgrestError = await postData(
    `/api/cart`,
    {
      oper: 'getpromo',
      code: code,
    }
  );
  console.log(
    'got back promo code data... ',
    JSON.stringify(promoCode, null, 2)
  );

  if (!('message' in promoCode)) {
    return promoCode;
  } else {
    return null;
  }
};
