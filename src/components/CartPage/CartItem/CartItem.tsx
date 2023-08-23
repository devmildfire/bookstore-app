import React from 'react';
import * as Styled from './CartItem.styled';

type CartItemProps = {
  bookCover: string;
  title: string;
  author: string;
  edition: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  handleDelete: () => void;
  incrementQuantity: () => void;
  decrimentQuantity: () => void;
};

const CartItem = (props: CartItemProps): React.ReactElement => {
  const {
    bookCover,
    title,
    author,
    edition,
    price,
    oldPrice,
    quantity,
    handleDelete,
    incrementQuantity,
    decrimentQuantity,
  } = props;

  return (
    <Styled.CartItemContainer>
      <Styled.BookImage src={bookCover} alt={title} />
      <Styled.ProductInfo>
        <Styled.BookTitle>{title}</Styled.BookTitle>
        <Styled.Author>{author}</Styled.Author>
      </Styled.ProductInfo>
      <Styled.Edition>{edition}</Styled.Edition>
      <Styled.PriceContainer>
        <Styled.BookPrice>{price}</Styled.BookPrice>
        {oldPrice && <Styled.OldBookPrice>{oldPrice}</Styled.OldBookPrice>}
      </Styled.PriceContainer>
      <Styled.QuantityContainer>
        <Styled.QuantityControls onClick={decrimentQuantity} disabled={quantity <= 1}>
          -
        </Styled.QuantityControls>
        <Styled.QuantityOfBooks>{quantity}</Styled.QuantityOfBooks>
        <Styled.QuantityControls onClick={incrementQuantity}>+</Styled.QuantityControls>
      </Styled.QuantityContainer>
      <Styled.PriceSum>{price * quantity}</Styled.PriceSum>
      <Styled.CloseButton type='button' onClick={handleDelete}>
        <Styled.CloseButtonIcon />
      </Styled.CloseButton>
    </Styled.CartItemContainer>
  );
};

CartItem.defaultProps = {
  oldPrice: null,
};

export default CartItem;
