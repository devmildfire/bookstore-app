import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Button from '../Button';
import Text from '../Text';
import StyledWrapper from './styles';

export interface CounterProps extends ClassNameProps {
  readonly value: number;
  readonly increment: () => void;
  readonly decrement: () => void;
}

const Counter = ({ increment, decrement, value }: CounterProps) => (
  <StyledWrapper>
    <Button onClick={decrement}>-</Button>
    <Text className='dropDownValue'>{value}</Text>
    <Button onClick={increment}>+</Button>
  </StyledWrapper>
);

export default React.memo(Counter);
