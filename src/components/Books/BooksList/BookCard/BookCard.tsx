import React, { useState } from 'react';
import Link from '@/components/Common/Link';
import { Book } from '@/types/book';
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

/* const SPACE_AFTER_AUTHOR_NAME_REGEXP = /(?<=[А-Я|Ё]\.)(\s)/g; */

interface BookCardProps {
  readonly book: Book;
}

const BookCard = ({ book }: BookCardProps): React.ReactElement => {
  const [liked, setLike] = useState(false);
  const {
    id, link, price, newPrice,
  } = book;
  return (
    <StyledWrapper tabIndex={0}>
      <Link href={`/books/${id}`}>
        <StyledImage
          className='cardImage'
          src={link}
          alt='BookDescription logo'
        />
      </Link>
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
          <StyledShopCard tabIndex={0} />
          <StyledLike
            liked={liked}
            onClick={() => setLike((prev) => !prev)}
            role='button'
            tabIndex={0}
          />
        </StyledIcons>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default BookCard;
