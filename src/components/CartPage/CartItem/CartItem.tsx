import React from 'react';
import * as Styled from './CartItem.styled';
import { CartItem as CartItemType } from '@/types/api';

// type CartItemProps = {
//   bookCover: string;
//   title: string;
//   author: string;
//   edition: string;
//   price: number;
//   oldPrice?: number;
//   quantity: number;
//   handleDelete: () => void;
//   incrementQuantity: () => void;
//   decrimentQuantity: () => void;
// };

const readableCategories = {
  PrintBook: 'печатное издание',
  AudioBook: 'аудиокнига',
  EBook: 'электронное издание',
  'Book2.0': 'книга 2.0',
  GiftCard: 'карта даров',
  BoxSet: 'бокс сет',
  Subscription: 'подписка',
  Course: 'курс',
};

interface CartItemProps extends CartItemType {
  handleDelete: () => void;
  incrementQuantity: () => void;
  decrimentQuantity: () => void;
}

function isValidCategory(k: string): k is keyof typeof readableCategories {
  return k in readableCategories;
}

const CartItem = (props: CartItemProps): React.ReactElement => {
  const {
    picture,
    name,
    subtitle,
    category,
    price,
    discount,
    quantity,
    handleDelete,
    incrementQuantity,
    decrimentQuantity,
  } = props;

  const currentPrice = discount ? price * (1 - discount / 100) : price;
  let readableCategory = '';
  if (isValidCategory(category)) {
    readableCategory = readableCategories[category];
  }

  return (
    <Styled.CartItemContainer>
      <Styled.BookImage src={picture} alt={name} />
      <Styled.ProductInfo>
        <Styled.BookTitle>{name}</Styled.BookTitle>
        <Styled.Author>{subtitle}</Styled.Author>
      </Styled.ProductInfo>
      <Styled.Edition>{readableCategory}</Styled.Edition>
      <Styled.PriceContainer>
        <Styled.BookPrice>{currentPrice}</Styled.BookPrice>
        {discount && <Styled.OldBookPrice>{price}</Styled.OldBookPrice>}
      </Styled.PriceContainer>
      <Styled.QuantityContainer>
        <Styled.QuantityControls
          onClick={decrimentQuantity}
          disabled={quantity <= 1}
        >
          -
        </Styled.QuantityControls>
        <Styled.QuantityOfBooks>{quantity}</Styled.QuantityOfBooks>
        <Styled.QuantityControls onClick={incrementQuantity}>
          +
        </Styled.QuantityControls>
      </Styled.QuantityContainer>
      <Styled.PriceSum>{currentPrice * quantity}</Styled.PriceSum>
      <Styled.CloseButton type='button' onClick={handleDelete}>
        <Styled.CloseButtonIcon />
      </Styled.CloseButton>
    </Styled.CartItemContainer>
  );
};

// CartItem.defaultProps = {
//   oldPrice: null,
// };

export default CartItem;
