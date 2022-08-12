import * as React from 'react';
import classNames from 'classnames';
import { Book } from '@/models/books';
import {
  StyledWrapper,
  StyledImage,
  StyledInfo,
  StyledActions,
  StyledIconButton,
  StyledLikeIcon
} from './styles';
import usePrepareLink from '@/hooks/usePrepareLink';
import { GET_PARAMS } from '@/consts/query';
import Price from '@/components/Common/Price';
import Cart from '@/components/Common/Icons/Cart';
import { ClassNameProps } from '@/types/className';
import Link from '@/components/Common/Link';
import { POPUPS } from '@/consts/popups';

interface BookCardProps
  extends Pick<Book, 'id' | 'image' | 'price' | 'newPrice' | 'title'>,
    ClassNameProps {
  readonly isOpen: boolean;
}

const BookCard: React.FC<BookCardProps> = (props) => {
  const { id, image, price, newPrice, title, isOpen, } = props;
  const [liked, setLike] = React.useState(false);

  /* TODO: Вынести ссылку обложки наружу, чтобы можно было использовать на странице книги */
  const path = usePrepareLink({
    query: {
      [GET_PARAMS.openProduct]: String(id),
    },
    keepOldQuery: true,
  });

  const basketPath = usePrepareLink({
    keepOldQuery: true,
    query: {
      [GET_PARAMS.popup]: POPUPS.addBasketBook,
      [GET_PARAMS.bookId]: id.toString(),
    },
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
          <StyledIconButton href={basketPath} scroll={false} shallow>
            <Cart />
          </StyledIconButton>
          <StyledIconButton onClick={() => setLike((prev) => !prev)}>
            <StyledLikeIcon isActive={liked} />
          </StyledIconButton>
        </StyledActions>
      </StyledInfo>
    </StyledWrapper>
  );
};

export default React.memo(BookCard);
