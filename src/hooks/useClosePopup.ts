import { useRouter } from 'next/router';
import { GET_PARAMS } from '@/consts/query';
import { VoidFunction } from '@/types/common';
import useEvent from './useEvent';
import usePrepareLink from './usePrepareLink';

const useClosePopup = (popupQueryName: string): VoidFunction => {
  const { push } = useRouter();
  const path = usePrepareLink({
    deleteQuery: {
      [GET_PARAMS.popup]: popupQueryName,
      [GET_PARAMS.bookId]: true,
    },
  });

  return useEvent(() => {
    push(path, undefined, {
      scroll: false,
      shallow: true,
    });
  });
};

export default useClosePopup;
