import React, { ButtonHTMLAttributes, memo, PropsWithChildren } from 'react';
import Text from '../Text';
import { StyledButton, StyledButtonProps } from './styles';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Partial<StyledButtonProps> {}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  const {
    children, variant = 'standard', rounded = false, ...params
  } = props;
  return (
    <StyledButton {...params} variant={variant} rounded={rounded}>
      <Text component='span' variant='body1' key={0}>
        {children}
      </Text>
    </StyledButton>
  );
};

export default memo(Button);
