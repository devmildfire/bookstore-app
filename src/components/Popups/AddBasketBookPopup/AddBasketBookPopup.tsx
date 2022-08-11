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
import PopupHeader from '@/components/Common/PopupHeader';
import PopupContent from '@/components/Common/PopupContent';
import BookInfo from './BookInfo';

interface AddBasketBookPopupProps extends ClassNameProps, BasePopupProps {}

const AddBasketBookPopup: React.FC<AddBasketBookPopupProps> = (props) => {
  const bookId = Number(useGetParam(GET_PARAMS.bookId));
  const { data: book, isLoading, isFetching, } = useGetBookQuery(bookId);
  const onClose = useClosePopup(POPUPS.addBasketBook);
  const hasBook = book && bookId;
  if (!hasBook) {
    return null;
  }
  const { title, authors, } = book;
  const subtitle = getAuthorNames(authors);
  const showLoading = isLoading || isFetching;
  return (
    <MainPopup {...props} onClose={onClose}>
      {showLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <PopupHeader title={title} subtitle={subtitle} />
          <PopupContent>
            <BookInfo {...book} />
          </PopupContent>
        </>
      )}
    </MainPopup>
  );
};

export default React.memo(AddBasketBookPopup);
