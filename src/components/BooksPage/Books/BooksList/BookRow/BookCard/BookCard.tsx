import * as React from 'react';
import classNames from 'classnames';
import { Book } from '@/models/books';
import {
  StyledWrapper,
  StyledImage,
  StyledInfo,
  StyledActions
} from './styles';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import IconButton from '@/components/Common/IconButton';
import Price from '@/components/Common/Price';
import useGetParam from '@/hooks/useGetParam';
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';

type BookCardProps = Pick<
  Book,
  'id' | 'image' | 'price' | 'newPrice' | 'title'
>;

const BookCard: React.FC<BookCardProps> = (props) => {
  const {
    id, image, price, newPrice, title,
  } = props;
  const [liked, setLike] = React.useState(false);

  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: String(id),
    },
    keepOldQuery: true,
  });
  /* TODO вынести определение открытой книги на уровень листа или строки */
  const openBook = Number(useGetParam(GET_PARAMS.openProduct));
  const classes = classNames({ active: openBook === id, });

  return (
    <StyledWrapper className={classes} href={path} scroll={false} shallow>
      <StyledImage src={image} alt={title} />
      <StyledInfo>
        <Price price={price} newPrice={newPrice} />
        <StyledActions>
          <IconButton>
            <Cart />
          </IconButton>
          <IconButton onClick={() => setLike((prev) => !prev)}>
            <Like isActive={liked} />
          </IconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default React.memo(BookCard);
