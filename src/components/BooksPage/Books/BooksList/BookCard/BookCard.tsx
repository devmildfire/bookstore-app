import React, { useState } from 'react';
import { Book } from '@/models/books';
import {
  StyledWrapper,
  StyledLike,
  StyledImage,
  StyledPriceInfo,
  StyledShopCard,
  StyledInfo,
  StyledIcons,
} from './styles';
import Text from '@/components/Common/Text';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import IconButton from '@/components/Common/IconButton';

interface BookCardProps
  extends Pick<Book, 'id' | 'link' | 'price' | 'newPrice'> {}

const BookCard = (props: BookCardProps): React.ReactElement => {
  const [liked, setLike] = useState(false);
  const {
    id, link, price, newPrice,
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
        src={link}
        alt='BookDescription logo'
      />
      <StyledInfo>
        <StyledPriceInfo>
          <Text variant='p' component='span' fontWeight={700}>
            {`${newPrice || price}₽`}
          </Text>
          {newPrice && (
            <Text color='red' fontWeight={700} component='span' variant='p'>
              <del>{`${price}₽`}</del>
            </Text>
          )}
        </StyledPriceInfo>
        <StyledIcons>
          <IconButton>
            <StyledShopCard />
          </IconButton>
          <IconButton onClick={() => setLike((prev) => !prev)}>
            <StyledLike liked={liked} />
          </IconButton>
        </StyledIcons>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default BookCard;
