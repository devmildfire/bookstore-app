import React, {
  KeyboardEvent as ReactKeyEvent,
  useContext,
  // useState,
} from 'react';
import { ModalContext } from 'pages/_app';

import {
  ProductItem,
  Cover,
  Footer,
  Price,
  PriceContainer,
  ButtonsContainer,
  Button,
  OldPrice,
} from './styles';
import CartIcon from '@/assets/icons/shop-cart.svg';
import { Book } from '@/models/books';

export interface ProductCardProps extends Book {
  onClick: () => void;
  onEnterKey: (event: ReactKeyEvent) => void;
}
export default function ProductCard(props: ProductCardProps) {
  const { price, cover, title, onClick, onEnterKey, newPrice } = props;
  const openModal = useContext(ModalContext);

  return (
    <ProductItem>
      <Cover
        tabIndex={0}
        onClick={onClick}
        onKeyDown={onEnterKey}
        width={350}
        height={525}
        quality={75}
        src={cover}
        alt={title}
      />
      <Footer>
        <PriceContainer>
          <Price>{`${newPrice === null ? price : newPrice}₽`}</Price>
          <OldPrice discount>{newPrice && `${price}₽`}</OldPrice>
        </PriceContainer>
        <ButtonsContainer>
          <Button type='button' onClick={() => openModal(true)}>
            <CartIcon />
          </Button>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </ProductItem>
  );
}
