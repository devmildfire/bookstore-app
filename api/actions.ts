'use server';

export const checkAdmin = (id: string): boolean => {
  const adminID = process.env.NEXT_PUBLIC_ADMIN_USER_ID!;

  console.log('checking user id for Admin status... ', id === adminID);

  return id === adminID;
};
