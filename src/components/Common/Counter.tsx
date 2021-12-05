import * as React from 'react';

import styled from 'styled-components';
import Button from './Button';

export type CounterProps = {
  className?: string
  value: number
  addToCart: () => void
  removeFromCart: () => void
}

const Counter = React.memo(({
  addToCart,
  removeFromCart,
  value,
}: CounterProps) => (
  <StyleWrapper>
    <>
      <Button
        text='-'
        className='counterButton'
        onClick={removeFromCart}
      />
      <div className='dropDownValue'>{value}</div>
      <Button
        text='+'
        className='counterButton'
        onClick={addToCart}
      />
    </>
  </StyleWrapper>
));

export default Counter;

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
    color: #FFFFFF;
  }
`;
