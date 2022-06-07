import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/types/api';
import Counter from '../Common/Counter';
import {
  StyledWrapper,
  StyledLike,
  StyledBookInfo,
  StyledCover,
  StyledImage,
  StyledDescription,
  StyledTitle,
  StyledAuthor,
  StyledPriceInfo,
  StyledOldPrice,
} from './styles';
import Text from '../Common/Text';
import Button from '../Common/Button';

const SPACE_AFTER_AUTHOR_NAME_REGEXP = /(?<=[А-Я|Ё]\.)(\s)/g;

type BookCardProps = {
  book: Book;
};

const BookCard = ({ book }: BookCardProps): React.ReactElement => {
  const [liked, setLike] = useState(false);
  const [inCardCount, setInCardCount] = useState(0);
  const {
    id, link, title, price, oldPrice, author, authors, description,
  } = book;

  const parsedAuthors = authors
    ?.join(', ')
    .replace(SPACE_AFTER_AUTHOR_NAME_REGEXP, '&nbsp;');
  const parsedDescription = description.map((paragraph) => (
    <Text component='p' variant='body2' key={paragraph}>
      {paragraph}
    </Text>
  ));

  const addToCart = useCallback(() => {
    setInCardCount((prev) => prev + 1);
  }, []);

  const removeFromCart = useCallback(() => {
    if (inCardCount > 0) {
      setInCardCount((prev) => prev - 1);
    }
  }, [inCardCount]);
  const hasAuthor = !!author || !!parsedAuthors;
  return (
    <StyledWrapper>
      <StyledCover>
        <Link href={`/books/${id}`} passHref>
          <a href='fakeHref'>
            <StyledImage
              className='cardImage'
              src={link}
              alt='BookDescription logo'
            />
          </a>
        </Link>
        <StyledBookInfo>
          <Text component='p' variant='body1'>
            {title}
          </Text>
          <StyledDescription>{parsedDescription}</StyledDescription>
        </StyledBookInfo>
      </StyledCover>
      <StyledTitle component='p' variant='subtitle1'>
        {title}
      </StyledTitle>
      {hasAuthor && (
        <StyledAuthor
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: parsedAuthors || author }}
        />
      )}
      <StyledPriceInfo>
        <Text fontWeight={600}>
          {oldPrice && (
            <StyledOldPrice color='red' fontWeight='inherit' component='span'>
              <del>{`${oldPrice}₽`}</del>
            </StyledOldPrice>
          )}
          {`${price}₽`}
        </Text>
        <StyledLike
          liked={liked}
          onClick={() => setLike((prev) => !prev)}
          role='button'
          tabIndex={0}
        />
      </StyledPriceInfo>
      {inCardCount ? (
        <Counter
          value={inCardCount}
          increment={addToCart}
          decrement={removeFromCart}
        />
      ) : (
        <Button
          onClick={addToCart}
          variant='wide'
          styleVariant='outlined'
          rounded
        >
          Добавить в корзину
        </Button>
      )}
    </StyledWrapper>
  );
};

export default BookCard;
