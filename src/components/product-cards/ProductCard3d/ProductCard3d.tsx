import React, { KeyboardEvent as ReactKeyEvent, useState } from 'react';

import Image from 'next/image';
import {
  BackCover,
  Book,
  BookWrapper,
  Cover,
  Footer,
  Lightmap,
  Pages,
} from './styles';

import { ButtonsContainer, OldPrice, Price, PriceContainer } from '../styles';
import CartIcon from '@/assets/icons/ui-icons/add-to-cart.svg';
import { IconButton } from '@/components/Common/IconButton';
import { useModal } from '@/components/Modal/Modal';
import { Title } from 'pages/books';
import { TriggerStyles } from '@/components/Common/Trigger/types';

export interface ProductCard3DProps extends Title {
  onOpenClick: () => void;
  onCloseClick: () => void;

  onEnterKey: (event: ReactKeyEvent) => void;
  buttonStyle: TriggerStyles;
  isOpen?: boolean;
}

function ProductCard3d(props: ProductCard3DProps) {
  const {
    prices,
    discount,
    cover,
    name,
    onOpenClick,
    onCloseClick,
    onEnterKey,
    authors,
    types,
  } = props;

  const [isCardOpen, setIsCardOpen] = useState(false);
  // console.log('open card state is ... ', isCardOpen);
  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState({
      cover,
      name,
      discount,
      price: prices,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal(true, 'book');
  };

  const disPrices = prices.map((price, index) =>
    Math.floor((price * (100 - discount[index])) / 100)
  );

  const minPrice = Math.min(...disPrices);

  const minIndex = disPrices.findIndex((x) => x === minPrice);

  return (
    <BookWrapper tabIndex={0}>
      <Book
        // onMouseUp={onClick}
        onMouseUp={() => {
          if (isCardOpen) {
            onCloseClick();
            setIsCardOpen(false);
          } else {
            onOpenClick();
            setIsCardOpen(true);
          }
        }}
        onKeyDown={onEnterKey}
        className='book'
      >
        <Cover
          alt='cover'
          src={cover}
          width={330}
          height={550}
          className='cover'
        />
        <Pages className='pages' />
        <BackCover aria-hidden='true' src={cover} className='back-cover' />
        <Lightmap className='lightmap' />
      </Book>
      <Footer>
        <PriceContainer>
          {/* FIXME: цены починены, но засчёт упрощения ключа prices в типе Title. Теперь там просто массив чисел*/}

          <Price>от {minPrice}</Price>
          <OldPrice discount={discount[minIndex]}>
            {`${prices[minIndex]}₽`}
          </OldPrice>
        </PriceContainer>
        <ButtonsContainer>
          <IconButton
            width={36}
            height={36}
            label='добавить в корзину'
            onClick={onAddToCartClick}
          >
            <CartIcon />
          </IconButton>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </BookWrapper>
  );
}

export default React.memo(ProductCard3d);
