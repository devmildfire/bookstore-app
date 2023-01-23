import * as React from 'react';
import BookPreviewCard from './BookPreviewCard';
import { COLLAPSE_DURATION, FADE_DURATION } from '@/consts/animation';
import { StyledPreviewContent, StyledPreviewHeader } from './styles';
import { Book } from '@/models/books';
import Fade from '@/components/Common/Fade';
import Preview from '@/components/Common/Preview';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';

interface BookPreviewProps {
  readonly books: Book[];
  readonly openBookId: number;
}

const BookPreview: React.FC<BookPreviewProps> = (props) => {
  const { books, openBookId } = props;

  const open = books.some((book) => book.id === openBookId);

  const exitHref = usePrepareLink({
    deleteQuery: { [GET_PARAMS.openProduct]: true },
  });

  return (
    <Preview
      open={open}
      duration={COLLAPSE_DURATION}
      exitTimeout={COLLAPSE_DURATION}
    >
      <StyledPreviewHeader exitHref={exitHref} />
      <StyledPreviewContent>
        {books.map((book) => (
          <Fade
            open={book.id === openBookId}
            key={book.id}
            enterTimeout={FADE_DURATION}
            exitTimeout={FADE_DURATION}
          >
            <BookPreviewCard {...book} />
          </Fade>
        ))}
      </StyledPreviewContent>
    </Preview>
  );
};

export default React.memo(BookPreview);
