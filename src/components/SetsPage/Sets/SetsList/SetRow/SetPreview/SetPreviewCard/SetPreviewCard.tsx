import * as React from 'react';
import { BoxSet } from '@/models/boxSets';
import BookCard from './BookCard';
import { StyledList, StyledWrapper } from './styles';

interface SetPreviewCardProps extends BoxSet {}

const SetPreviewCard: React.FC<SetPreviewCardProps> = (props) => {
  const { books } = props;
  return (
    <StyledWrapper>
      <StyledList gap={[56, 150]}>
        {books.map((book) => (
          <BookCard {...book} key={book.id} />
        ))}
      </StyledList>
    </StyledWrapper>
  );
};

export default React.memo(SetPreviewCard);
