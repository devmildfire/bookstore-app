import React, { KeyboardEvent as ReactKeyEvent } from 'react';
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
import { useModal } from '../Modal/Modal';

export interface ProductCardProps extends Book {
  onClick: () => void;
  onEnterKey: (event: ReactKeyEvent) => void;
}

export default function ProductCard(props: ProductCardProps) {
  const { price, cover, title, onClick, onEnterKey, newPrice, authors, types } =
    props;
  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState!({
      title,
      price,
      newPrice,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal!(true);
  };

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
          <Button type='button' onClick={onAddToCartClick}>
            <CartIcon />
          </Button>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </ProductItem>
  );
}
