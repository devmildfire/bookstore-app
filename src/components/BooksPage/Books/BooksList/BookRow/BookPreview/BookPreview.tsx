import * as React from 'react';
import BookPreviewCard from './BookPreviewCard';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';
import { COLLAPSE_DURATION, FADE_DURATION } from '@/consts/animation';
import { StyledPreview, StyledPreviewContent } from './styles';
import { Book } from '@/models/books';
import Fade from '@/components/Common/Fade';
import PreviewHeader from '@/components/Common/PreviewHeader';

interface BookPreviewProps {
  readonly books: Book[];
}

const BookPreview: React.FC<BookPreviewProps> = (props) => {
  const { books } = props;

  const bookId = Number(useGetParam(GET_PARAMS.openProduct));

  const open = books.some((book) => book.id === bookId);

  return (
    <StyledPreview
      open={open}
      duration={COLLAPSE_DURATION}
      exitTimeout={COLLAPSE_DURATION}
    >
      <PreviewHeader exitHref='/books' />
      <StyledPreviewContent>
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
      </StyledPreviewContent>
    </StyledPreview>
  );
};

export default BookPreview;
