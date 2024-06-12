import styled from 'styled-components';
import closeButton from '../../../assets/icons/close-button.svg';

export const CartItemContainer = styled.li`
  display: grid;
  grid-template-columns: 150px 250px repeat(4, 1fr) 24px;

  /* max-height: 144px; */
  justify-items: center;
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: content-box;
  margin-bottom: 32px;
  transition: 0.3s;
  /* column-gap: 14px; */

  /* * {
    outline: 1px solid green;
  } */

  :hover {
    background-color: #202020;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 100px 200px repeat(4, 1fr) 24px;
    margin-bottom: 26px;
  }

  @media (max-width: 768px) {
    border-bottom: none;
    grid-template-columns:
      minmax(110px, 150px) minmax(120px, auto) minmax(30px, auto)
      24px;
    justify-items: left;
    grid-template-areas:
      'image  text . button'
      'image  edition . .'
      'image  quantity price price';

    grid-template-rows: repeat(2, min-content) 1fr;
  }

  @media (max-width: 568px) {
    margin-bottom: 38px;
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
  padding-left: 20px;
  width: 100%;

  @media (max-width: 768px) {
    padding-left: 0;

    grid-area: text;
  }
`;

export const BookImage = styled.img`
  width: 100%;

  @media (max-width: 768px) {
    grid-area: image;
  }
`;

export const BookTitle = styled.h3`
  text-align: left;
  font-weight: 700;
  font-size: 20px;
  padding: 0 0 5px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding-left: 11px;
  }

  @media (max-width: 744px) {
    font-size: 12px;
  }
`;

export const Author = styled.p`
  width: fit-content;
  margin-bottom: 7px;
  font-size: 18px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding-left: 11px;
  }

  @media (max-width: 744px) {
    font-size: 12px;
  }
`;

export const Edition = styled.p`
  font-size: 16px;
  font-weight: 400;
  width: fit-content;
  white-space: break-spaces;
  padding: 0 10px;
  margin-bottom: 11px;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 14px;
  }

  @media (max-width: 768px) {
    grid-area: edition;
    padding-left: 11px;
  }

  @media (max-width: 744px) {
    font-size: 10px;
    text-align: left;
  }
`;

export const BookPrice = styled.span`
  font-weight: 700;
  font-size: 20px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    grid-area: text;
  }

  @media (max-width: 744px) {
    font-size: 12px;
    text-align: left;
    padding: 0;
  }
`;

export const OldBookPrice = styled.span`
  font-size: 20px;
  color: var(--main-red-100);
  text-decoration: line-through;
  font-weight: 500;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 744px) {
    font-size: 12px;
    text-align: left;
    padding: 0;
  }
`;

export const QuantityOfBooks = styled.span`
  font-size: 20px;
  margin: 0 24px;

  @media (max-width: 1024px) {
    font-size: 16px;
    margin: 0 12px;
  }

  @media (max-width: 744px) {
    font-size: 12px;
    margin: 0 6px;
  }
`;

export const QuantityControls = styled.button`
  cursor: pointer;
  color: white;
  font-weight: 700;
  font-size: 20px;
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: none;

  :disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 744px) {
    font-size: 12px;
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
  /* padding: 0; */
  /* margin-right: 14px; */
  width: 24px;
  height: 24px;
  align-self: center;

  @media (max-width: 768px) {
    align-self: flex-start;
    grid-area: button;
  }
`;

export const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    margin-left: auto;
    margin-top: auto;

    margin-right: 6px;

    grid-area: price;
  }
`;

export const QuantityContainer = styled.div`
  /* min-width: 128px; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    grid-area: quantity;
    margin-top: auto;
  }
`;

export {};
