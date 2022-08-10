import { useRouter } from 'next/router';
import getParam from '@/utils/getParam';

const useGetParam = <T extends string>(paramName: string): T | null => {
  const { query } = useRouter();
  return getParam(query, paramName);
};

export default useGetParam;
