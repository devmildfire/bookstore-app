import * as React from 'react';
import BookPreviewCard from './BookPreviewCard';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import { COLLAPSE_DURATION, FADE_DURATION } from '@/consts/animation';
import { StyledPreview } from './styles';
import useScrollTo from '@/hooks/useScrollTo';
import { Book } from '@/models/books';
import Fade from '@/components/Common/Fade';

interface BookPreviewProps {
  readonly books: Book[];
}

const BookPreview: React.FC<BookPreviewProps> = (props) => {
  const { books } = props;

  const bookId = Number(useGetParam(GET_PARAMS.openProduct));
  const [rootRef, setRootRef] = React.useState<HTMLElement | null>(null);

  const open = books.some((book) => book.id === bookId);

  useScrollTo(rootRef, { condition: open, timeout: COLLAPSE_DURATION });

  return (
    <StyledPreview
      open={open}
      duration={COLLAPSE_DURATION}
      exitTimeout={COLLAPSE_DURATION}
      ref={setRootRef}
    >
      {books.map((book) => (
        <Fade
          open={book.id === bookId}
          key={book.id}
          enterTimeout={FADE_DURATION}
          exitTimeout={FADE_DURATION}
        >
          <BookPreviewCard {...book} />
        </Fade>
      ))}
    </StyledPreview>
  );
};

export default BookPreview;
