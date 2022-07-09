import * as React from 'react';
import BookCardPreviewInfo from './BookCardPreviewInfo';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import Preview from '@/components/Common/Preview';
import { FADE_TIMEOUT } from '@/consts/animation';

interface BookCardPreviewProps {
  readonly allowedId: number[];
}

const BookCardPreview: React.FC<BookCardPreviewProps> = (props) => {
  const { allowedId } = props;
  const bookId = Number(useGetParam(GET_PARAMS.openProduct));
  const [lastId, setLastId] = React.useState<number | null>(null);
  const isCurrentBook = lastId === bookId;
  const open = allowedId.includes(bookId);

  React.useEffect(() => {
    if (open && !isCurrentBook) {
      /* Чтобы успевать проанимировать переключение */
      setTimeout(() => setLastId(bookId), FADE_TIMEOUT);
    }
  }, [open, isCurrentBook, bookId]);

  return (
    <Preview open={open} changing={!isCurrentBook} timeout={FADE_TIMEOUT}>
      <BookCardPreviewInfo bookId={bookId} />
    </Preview>
  );
};

export default BookCardPreview;
