import { PostgrestError } from '@supabase/supabase-js';
import { PromoCodeType } from 'pages/api/cart';
import { postData } from '@/utils/postData';

interface getPromoProps {
  setPromo: (promo: PromoCodeType | null) => void;
  setError: (promoError: PostgrestError | null) => void;
  code: string;
}

export const getPromoCodeFromDB = async ({
  setPromo,
  setError,
  code,
}: getPromoProps) => {
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
    setPromo(promoCode);
    setError(null);
    return promoCode;
  } else {
    setPromo(null);
    setError(promoCode);
    return null;
  }
};
