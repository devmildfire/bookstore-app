import * as React from 'react';

import styled from 'styled-components';
import Button from './Button';

export type CounterProps = {
  className?: string;
  value: number;
  addToCart: () => void;
  removeFromCart: () => void;
};

const Counter = ({ addToCart, removeFromCart, value }: CounterProps) => (
  <StyleWrapper>
    <>
      <Button onClick={removeFromCart} variant='square'>
        -
      </Button>
      <div className='dropDownValue'>{value}</div>
      <Button onClick={addToCart} variant='square'>
        +
      </Button>
    </>
  </StyleWrapper>
);

export default React.memo(Counter);

// Styles
const StyleWrapper = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 21px;
  font-weight: bold;
  user-select: none;
  width: 320px;
  height: 70px;

  .dropDownValue {
    margin: 0 5px;
    width: 38px;
    text-align: center;
    color: #ffffff;
  }
`;
