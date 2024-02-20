import { CartItemType, PromoCodeType } from "pages/api/cart";
import * as Styled from '../Payment/Payment.styled';
import { FormEvent, useEffect, useState } from "react";
import { postData } from "@/utils/postData";
import { PostgrestError } from "@supabase/supabase-js";

interface getPromoProps {
 setPromo: (promo: PromoCodeType | PostgrestError) => void;
 code: string
}

const getPromoCodeFromDB = async ({setPromo, code}: getPromoProps) => {

    const promoCode: PromoCodeType | PostgrestError = await postData(`/api/cart`, {
        oper: 'getpromo',
        code: code,
      });
      console.log(
        'got back promo code data... ',
        JSON.stringify(promoCode, null, 2)
      );
    //   setCart([...cartItems]);

    // if (!( 'message' in promoCode )) {
    //     setPromo(promoCode)
    // } 
        setPromo(promoCode)

}



interface promoProps {
    cart: CartItemType[];
  }

const Promocode = ({ cart }: promoProps): React.ReactElement => {
    const [code, setCode] = useState('');
    const [promo, setPromo] = useState<PromoCodeType | PostgrestError>()

    useEffect(() => {
        console.log('setting code ..');
        code && getPromoCodeFromDB({setPromo, code});
    }, [code]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement
        const data = new FormData(form);
        const code = data.get('code') as string
        // const code = form.elements[0]
        console.log('promo submitted')
        console.log('code is ...', code);
        setCode(code)
    }
    

    return (

    
      <form onSubmit={onSubmit}>
  
        <Styled.Subtitle>Промокод</Styled.Subtitle>
        <Styled.Input name='code'  placeholder='Введите промокод' type="text" maxLength={20}/>
        <Styled.Button type="submit" >Применить</Styled.Button>

        <pre>
        {promo && JSON.stringify(promo, null, 2)}
      </pre>
      </ form>

      
    
    );
  };
  
  export default Promocode;