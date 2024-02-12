import styled from 'styled-components';
import closeButton from '../../../assets/icons/close-button.svg';

export const CartItemContainer = styled.li`
  display: grid;
  grid-template-columns: 150px 150px repeat(4, 1fr) 24px;

  max-height: 144px;
  justify-items: center;
  align-items: center;
  /* padding-bottom: 30px;
  padding-right: 16px; */
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: content-box;
  margin-bottom: 20px;
  /* border-bottom: 1px solid #dcdcdc33; */
  transition: 0.3s;

  /* * {
    outline: 1px solid green;
  } */

  :hover {
    background-color: #202020;
  }

  @media (max-width: 768px) {
    border-bottom: none;
    grid-template-columns: minmax(121px, 150px) minmax(130px, auto) 24px;
    justify-items: left;
    grid-template-areas:
      'image text button'
      'image edition .'
      'image price .'
      'image quantity .';
  }

  @media (max-width: 568px) {
    margin-bottom: 40px;
  }
`;

export const Product = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const ProductInfo = styled.div`
  @media (max-width: 768px) {
    grid-area: text;
  }
`;

export const BookImage = styled.img`
  height: 144px;
  min-width: 103px;
  margin-right: 18px;
  box-shadow: 1px 1px 7px rgba(85, 85, 85, 0.37);
  @media (max-width: 768px) {
    grid-area: image;
  }
`;

export const BookTitle = styled.h3`
  font-weight: 700;
  font-size: 20px;
  padding: 0 0 5px;
`;

export const Author = styled.p`
  width: fit-content;
  margin-bottom: 7px;
`;

export const Edition = styled.p`
  font-weight: 400;
  width: fit-content;
  white-space: break-spaces;
  padding: 0 10px;
  margin-bottom: 11px;
  @media (max-width: 768px) {
    grid-area: edition;
  }
`;

export const BookPrice = styled.span`
  font-weight: 700;
  margin-right: 7px;
  @media (max-width: 768px) {
    grid-area: text;
  }
`;

export const OldBookPrice = styled.span`
  color: var(--main-red);
  text-decoration: line-through;
  font-weight: 500;
`;

export const QuantityOfBooks = styled.span`
  font-size: 20px;
  margin: 0 20px;
`;

export const QuantityControls = styled.button`
  cursor: pointer;
  color: white;
  font-weight: 700;
  font-size: 24px;
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: none;

  :disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const PriceSum = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const CloseButtonIcon = styled(closeButton)``;

export const CloseButton = styled.button`
  cursor: pointer;
  background-color: transparent;
  padding: 0;
  margin-right: 14px;
  width: 24px;
  height: 24px;
  align-self: center;

  @media (max-width: 768px) {
    align-self: flex-start;
    grid-area: button;
  }
`;

export const PriceContainer = styled.div`
  @media (max-width: 768px) {
    grid-area: price;
  }
`;

export const QuantityContainer = styled.div`
  min-width: 128px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    grid-area: quantity;
  }
`;

export {};
