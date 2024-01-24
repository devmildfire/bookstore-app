import { supabaseService } from "api";
import { UUID } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

async function getCart(id: string) {
    const {data, error} = await supabaseService.from('Cart').select('*').eq('id', id)

    if (error) {
        console.error(error);
        return error;
      } else {
        // data && console.log('data is ...', JSON.stringify(data, null, 2));
        return data;
      }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // res.status(200).json({message: "returned message from api call"})
    const body = req.body
    console.log("body is",body);
    
    const cartID: string = body.id 
    console.log("id is",cartID);


    const cart = await getCart(cartID)
    res.status(200).json(cart)

}