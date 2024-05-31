import { supabase } from 'api/supabase-client';

export const getAllEnums = async (): Promise<
  Record<string, string[]>[] | null
> => {
  const { data } = await supabase.rpc('get_enums');
  if (data) {
    return data as Record<string, string[]>[];
  } else {
    return null;
  }
};

// вызовет функцию в базе данных, которая найдёт всё enum и для каждого сложит
// его значения и имя в записи. Из записей будет образован  массив
// этот массив в качестве json вернётся в качестве результата запроса

//  create function
//   get_enums () returns json language sql as $func$
// select json_agg(select_results)
//   from (
// select
//       n.nspname as enum_schema,
//       t.typname as enum_name,
//       e.enumlabel as enum_value
//     from
//       pg_type t
//       join pg_enum e on t.oid = e.enumtypid
//       join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
//   ) select_results
// $func$;
