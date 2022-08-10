import * as React from 'react';
import MainPopup from '@/components/Common/MainPopup';
import { ClassNameProps } from '@/types/className';
import { BasePopupProps } from '@/types/popups';
import { useGetBookQuery } from '@/models/books';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import LoadingIndicator from '@/components/Common/LoadingIndicator';
import getAuthorNames from '@/utils/getAuthorNames';
import useClosePopup from '@/hooks/useClosePopup';
import { POPUPS } from '@/consts/popups';

interface AddBasketBookPopupProps extends ClassNameProps, BasePopupProps {}

const AddBasketBookPopup: React.FC<AddBasketBookPopupProps> = (props) => {
  const bookId = Number(useGetParam(GET_PARAMS.bookId));
  const { data: book, isLoading, } = useGetBookQuery(bookId);
  const onClose = useClosePopup(POPUPS.addBasketBook);
  const hasBook = book && bookId;
  if (!hasBook) {
    return null;
  }
  return (
    <MainPopup
      {...props}
      onClose={onClose}
      title={book.title}
      subtitle={getAuthorNames(book.authors)}
    >
      {isLoading ? <LoadingIndicator /> : null}
    </MainPopup>
  );
};

export default React.memo(AddBasketBookPopup);
