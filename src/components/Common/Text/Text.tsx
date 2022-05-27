import React, { PropsWithChildren } from 'react';
import { ClassNameProps } from '@/types/className';
import StyledText, { StyledTextProps, tagMap } from './styles';
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
    component,
    variant = 'body1',
    align = 'inherit',
    color = 'white',
    ...params
  } = props;

  const as = component || tagMap[variant];

  return (
    <StyledText
      as={as}
      align={align}
      variant={variant}
      className={className}
      color={color}
      {...params}
    >
      {children}
    </StyledText>
  );
};
