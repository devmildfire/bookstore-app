const parseGetParams = <T extends string>(
  rawQuery: string | null
): T[] => {
  return (rawQuery?.split(',') || []) as T[];
};

export default parseGetParams;
