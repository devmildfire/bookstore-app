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

  /**
   * Почему то выдает тип, в котором не as
   * Но он там должен быть, по этому пока что any
   */
  return (
    <StyledText
      as={as as any}
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
