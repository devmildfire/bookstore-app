import React, { PropsWithChildren } from 'react';
import { ClassNameProps } from '../../../types/className';
import StyledText, { StyledTextProps } from './styles';
import { Component } from './types';

export interface TextProps extends Partial<StyledTextProps>, ClassNameProps {
  readonly component?: Component;
}

export const Text = (
  props: PropsWithChildren<TextProps>,
): React.ReactElement => {
  const {
    children,
    className,
    component = 'span',
    variant = component,
    align = 'inherit',
    fontFamily = 'sans',
    textTransform = 'initial',
    color = 'white',
  } = props;

  return (
    <StyledText
      as={component}
      align={align}
      variant={variant}
      className={className}
      fontFamily={fontFamily}
      textTransform={textTransform}
      color={color}
    >
      {children}
    </StyledText>
  );
};
