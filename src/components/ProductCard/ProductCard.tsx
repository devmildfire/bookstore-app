import React, { KeyboardEvent as ReactKeyEvent } from 'react';
import {
  ProductItem,
  Cover,
  Footer,
  Price,
  PriceContainer,
  ButtonsContainer,
  Button,
  BuyIcon,
  OldPrice,
} from './styles';
import { Book } from '@/models/books';
import { useModal } from '../Modal/Modal';
import { TriggerStyles } from '../Common/Trigger/Trigger';

export interface ProductCardProps extends Book {
  onClick: () => void;
  onEnterKey: (event: ReactKeyEvent) => void;
  buttonStyle: TriggerStyles;
}

export default function ProductCard(props: ProductCardProps) {
  const { price, cover, title, onClick, onEnterKey, newPrice, authors, types } =
    props;
  const { handleModalState, handleOpenModal } = useModal();

  const onAddToCartClick = () => {
    handleModalState({
      title,
      price,
      // newPrice,
      author: authors.map((author) => author.name).join(', '),
      types,
    });
    handleOpenModal(true, 'book');
  };

  return (
    <ProductItem>
      <Cover
        tabIndex={0}
        onMouseUp={onClick}
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
          <Button
            variant={props.buttonStyle}
            leftSlot={<BuyIcon />}
            onClick={onAddToCartClick}
          >
            Обрести
          </Button>
          {/* <Button type='button'>В Избранное</Button> */}
        </ButtonsContainer>
      </Footer>
    </ProductItem>
  );
}
