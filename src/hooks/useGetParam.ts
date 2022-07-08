import { useRouter } from 'next/router';

const useGetParam = (paramName: string): string | string[] | null => {
  const { query } = useRouter();
  return query[paramName] || null;
};

export default useGetParam;
