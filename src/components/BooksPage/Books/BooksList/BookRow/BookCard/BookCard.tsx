import React, { useState } from 'react';
import { Book } from '@/models/books';
import {
  StyledWrapper,
  StyledLike,
  StyledImage,
  StyledShopCard,
  StyledInfo,
  StyledActions,
} from './styles';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import IconButton from '@/components/Common/IconButton';
import Price from '@/components/Common/Price';

interface BookCardProps
  extends Pick<Book, 'id' | 'image' | 'price' | 'newPrice'> {}

const BookCard = (props: BookCardProps): React.ReactElement => {
  const [liked, setLike] = useState(false);
  const {
    id, image, price, newPrice,
  } = props;
  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: id,
    },
  });

  return (
    <StyledWrapper href={path} scroll={false}>
      <StyledImage
        className='cardImage'
        src={image}
        alt='BookDescription logo'
      />
      <StyledInfo>
        <Price price={price} newPrice={newPrice} />
        <StyledActions>
          <IconButton>
            <StyledShopCard />
          </IconButton>
          <IconButton onClick={() => setLike((prev) => !prev)}>
            <StyledLike liked={liked} />
          </IconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default BookCard;
