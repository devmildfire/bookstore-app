import styled from 'styled-components';

export const Button = styled.button`
  cursor: pointer;
  height: 32px;
  padding: 0 40px;

  border-radius: 4px;
  /* margin-bottom: 30px; */
  grid-area: apply;

  @media (min-width: 768px) {
    height: 45px;
    /* width: 160px; */
  }

  @media (min-width: 1024px) {
    height: 50px;
    /* width: 160px; */
  }

  :hover {
    background-color: var(--main-red-100);
  }

  transition: all 0.2s;
`;

export const CheckoutButton = styled(Button)`
  background-color: transparent;
  color: white;
  border: 1px solid white;
  width: 280px;

  /* margin: 20px 0px 10px; */
  /* grid-area: checkout; */

  @media (max-width: 530px) {
    width: 100%;
  }
`;

export const PromoButton = styled(Button)`
  background-color: transparent;
  color: white;
  border: 1px solid white;
  width: auto;
  grid-area: checkout;

  @media (max-width: 530px) {
    margin: 0;
    padding: 0 10px;
  }
`;

export const Instruction = styled.p`
  font-size: 12px;
  max-width: 230px;
  grid-area: text;

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

export const Container = styled.div`
  width: 100%;
  font-size: 16px;
  display: flex;
  margin: 2vw 0px;
  justify-content: space-between;

  > div {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// @media (min-width: 1440px) {
//   grid-template-areas:
//     '. . quantity'
//     'input-label . . sum'
//     'input-label . . promoPrice'
//     'input apply . checkout'
//     '. . . text';
// }

// @media (min-width: 1024px) {
//   font-size: 20px;
// }

// @media (min-width: 530px) {
//   display: grid;
//   /* grid-template-columns: minmax(auto, 320px) auto minmax(auto, 320px); */
//   grid-template-columns: minmax(210px, 320px) auto auto minmax(210px, 320px);
//   justify-content: space-between;
//   grid-column-gap: 20px;
//   grid-template-areas:
//     '. . . quantity'
//     'input-label . . sum'
//     'input-label . . promoPrice'
//     'input . . checkout'
//     'apply . . text';
// }

export const Subtitle = styled.h2`
  font-weight: 400;
  font-size: 16px;
  margin-bottom: 15px;
  grid-area: input-label;
  @media (min-width: 768px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`;

export const Input = styled.input`
  height: 32px;
  background: #767676;
  padding: 0px 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  width: 150px;
  grid-area: input;

  ::placeholder {
    color: #10101080;
    text-align: center;
  }

  @media (min-width: 768px) {
    height: 45px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    height: 50px;
    margin-bottom: 15px;
    width: 200px;
  }

  @media (min-width: 1920px) {
    width: 300px;
  }
`;

export {};
