import * as React from 'react';
import BookCardPreviewInfo from './BookCardPreviewInfo';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import Fade from '@/components/Common/Fade';

interface BookCardPreviewProps {
  readonly allowedId: number[];
}

const BookCardPreview: React.FC<BookCardPreviewProps> = (props) => {
  const { allowedId } = props;
  const bookId = Number(useGetParam(GET_PARAMS.openProduct));
  const [lastId, setLastId] = React.useState<number>(bookId);
  const open = allowedId.includes(bookId);
  React.useEffect(() => {
    if (open && lastId !== bookId) {
      setLastId(bookId);
    }
  }, [open, lastId, bookId]);

  if (!open) {
    return null;
  }
  return (
    <Fade open={lastId === bookId}>
      <BookCardPreviewInfo bookId={bookId} />
    </Fade>
  );
};

export default BookCardPreview;
