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
import Cart from '@/components/Common/Icons/Cart';
import Like from '@/components/Common/Icons/Like';
import { ClassNameProps } from '@/types/className';
import Link from '@/components/Common/Link';

interface BookCardProps
  extends Pick<Book, 'id' | 'image' | 'price' | 'newPrice' | 'title'>,
    ClassNameProps {
  readonly isOpen: boolean;
}

const BookCard: React.FC<BookCardProps> = (props) => {
  const { id, image, price, newPrice, title, isOpen, } = props;
  const [liked, setLike] = React.useState(false);

  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: String(id),
    },
    keepOldQuery: true,
  });

  const classes = classNames('lighted', { active: isOpen, });

  return (
    <StyledWrapper>
      <Link className={classes} href={path} scroll={false} shallow>
        <StyledImage src={image} alt={title} />
      </Link>
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
