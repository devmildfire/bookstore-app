import React from 'react';
import StyledText, { StyledTextProps } from './styles';
import { Component } from './types';

export interface TextProps extends Partial<StyledTextProps> {
  component?: Component;
  children?: React.ReactNode | React.ReactNode[];
  className?: string;
}

export const Text = (props: TextProps): React.ReactElement => {
  const {
    children,
    className,
    component = 'span',
    variant = component,
    align = 'start',
    fontFamily = 'sans',
  } = props;

  return (
    <StyledText
      as={component}
      align={align}
      variant={variant}
      className={className}
      fontFamily={fontFamily}
    >
      {children}
    </StyledText>
  );
};
