import styled from 'styled-components';

export const Button = styled.button`
  cursor: pointer;
  height: 40px;
  padding: 0;

  border-radius: 4px;
  margin-bottom: 30px;
  grid-area: apply;

  @media (min-width: 768px) {
    height: 48px;
    /* width: 160px; */
  }

  @media (min-width: 1024px) {
    height: 70px;
    width: 160px;
  }
`;

export const CheckoutButton = styled(Button)`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  width: auto;
  margin: 50px 0px 10px;
  grid-area: checkout;

  @media (min-width: 530px) {
    margin: 0;
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
  font-size: 16px;
  display: flex;
  flex-direction: column;
  margin: 50px 19px;

  @media (min-width: 530px) {
    display: grid;
    /* grid-template-columns: minmax(auto, 320px) auto minmax(auto, 320px); */
    grid-template-columns: minmax(210px, 320px) auto minmax(210px, 320px);
    grid-column-gap: 20px;
    grid-template-areas:
      '. . quantity'  
      'input-label . sum'
      'input . checkout'
      'apply . text';
  }

  @media (min-width: 1024px) {
    font-size: 20px;
  }

  @media (min-width: 1440px) {
    grid-template-areas:
      '. . quantity'
      'input-label . sum'
      'input apply checkout'
      '. . text';
  }
`;

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
  height: 40px;
  background: #767676;
  padding: 0px 16px;
  border-radius: 4px;
  margin-bottom: 10px;
  grid-area: input;

  ::placeholder {
    color: #10101080;
    text-align: center;
  }

  @media (min-width: 768px) {
    height: 48px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    height: 70px;
    margin-bottom: 15px;
  }
`;

export {};
