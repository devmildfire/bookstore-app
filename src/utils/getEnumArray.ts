import { supabase } from 'api/supabase-client';

export const getEnumArray = async (
  enumName: string
): Promise<string[] | null> => {
  const { data } = await supabase.rpc('get_types', { enum_type: enumName });
  if (data) {
    // console.log(`got back ${enumName} enum from DB... `, data);
    return data as string[];
  } else {
    // console.log('no data returned');
    return null;
  }
};
