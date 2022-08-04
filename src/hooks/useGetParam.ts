import { useRouter } from 'next/router';
import getParam from '@/utils/getParam';

const useGetParam = (paramName: string): string | null => {
  const { query } = useRouter();
  return getParam(query, paramName);
};

export default useGetParam;
