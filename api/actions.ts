'use server';
import { revalidatePath } from "next/cache";


//  use this file for storing server actions

//  this was a server action to check if a user has admin status
//  but currently another way is employed.

// export const checkAdmin = (id: string): boolean => {
//   const adminID = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

//   console.log('checking user id for Admin status... ', id === adminID);

//   return id === adminID;
// };


export default async function revalidateLink(path: string) {
    revalidatePath(path);
}

export {revalidateLink};
