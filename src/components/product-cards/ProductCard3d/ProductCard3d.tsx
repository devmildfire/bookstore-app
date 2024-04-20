import React from 'react';
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
import { ProductCardProps } from '../ProductCard/ProductCard';

function ProductCard3d(props: ProductCardProps) {
  const { prices, discount, cover, name, onClick, onEnterKey, authors, types } =
    props;

  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState({
      cover,
      name,
      // FIXME: цены сломались
      price: [300],
      discount,
      // price: Math.min(...price),
      // newPrice,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal(true, 'book');
  };

  return (
    <BookWrapper tabIndex={0}>
      <Book onMouseUp={onClick} onKeyDown={onEnterKey} className='book'>
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
          {/* FIXME: цены сломались */}
          <Price>от {`300₽`}</Price>
          {/* <OldPrice discount>{newPrice `${price}₽`}</OldPrice> */}
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
