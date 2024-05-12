import React, { KeyboardEvent as ReactKeyEvent } from 'react';
import {
  ProductItem,
  Cover,
  Footer,
  Price,
  PriceContainer,
  ButtonsContainer,
  Button,
  // BuyIcon,
  OldPrice,
} from '../styles';
import CartIcon from '@/assets/icons/ui-icons/add-to-cart.svg';
// import { Title } from '@/models/books';
import { useModal } from '../../Modal/Modal';
import { TriggerStyles } from '@/components/Common/Trigger/types';
// import { ITitle } from '@/entities/title/client';
import { Title } from 'pages/books';

export interface ProductCardProps extends Title {
  onClick: () => void;
  onEnterKey: (event: ReactKeyEvent) => void;
  buttonStyle: TriggerStyles;
  isOpen?: boolean;
}

function ProductCard(props: ProductCardProps) {
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
        alt={name}
      />
      <Footer>
        <PriceContainer>
          {/* FIXME: цены сломались */}
          <Price>{`300₽`}</Price>
          {/* <OldPrice discount>{newPrice && `${price}₽`}</OldPrice> */}
        </PriceContainer>
        <ButtonsContainer>
          <Button
            variant={props.buttonStyle}
            leftSlot={<CartIcon />}
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

export default React.memo(ProductCard);
