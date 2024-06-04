import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

console.log('nodetest hello');

const envSupabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// const supabase = createClient<Database>(
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getAllEnums = async (): Promise<Record<string, string>[] | null> => {
  const { data } = await supabase.rpc('get_enums');
  if (data) {
    return data as Record<string, string>[];
  } else {
    return null;
  }
};

const printEnums = async () => {
  const enums = await getAllEnums();

  // console.log('printing enums ... ', enums);

  const cutEnums = enums?.filter((item) => item.enum_schema === 'public');

  const aggregatedEnums: Record<string, string[]> = {};

  cutEnums?.forEach((item) => {
    const key = item.enum_name;
    const value = item.enum_value;

    if (key in aggregatedEnums) {
      aggregatedEnums[key].push(value);
    } else {
      aggregatedEnums[key] = [value];
    }
  });

  console.log('big enums array is ... ', aggregatedEnums);

  const content =
    `export const allEnums = ` + JSON.stringify(aggregatedEnums, null, 2);

  try {
    fs.writeFileSync('./src/utils/allEnums.js', content);
    // file written successfully
  } catch (err) {
    console.error(err);
  }

  for (const key in aggregatedEnums) {
    const keyString = `export const ${key} = `;
    // const arrayString = aggregatedEnums[key];
    const arrayString = JSON.stringify(aggregatedEnums[key], null, 2);
    const endString = ' as const;';

    const contentString = keyString + arrayString + endString;
    console.log(contentString);

    try {
      fs.writeFileSync(`./src/utils/EnumStrings/${key}.ts`, contentString);
      // file written successfully
    } catch (err) {
      console.error(err);
    }
  }
};

printEnums();
