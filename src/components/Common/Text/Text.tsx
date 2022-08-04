/* eslint-disable no-undef */
import * as React from 'react';

import { ClassNameProps } from '@/types/className';
import StyledText, { StyledTextProps, tagMap } from './styles';

export interface TextProps<E extends keyof HTMLElementTagNameMap>
  extends Partial<StyledTextProps>,
    ClassNameProps,
    React.HTMLAttributes<HTMLElementTagNameMap[E]> {
  readonly component?: E;
}

export const Text = <E extends keyof HTMLElementTagNameMap>(
  props: TextProps<E>,
): React.ReactElement => {
  const {
    children,
    component,
    variant = 'text',
    align = 'inherit',
    textColor = 'white',
    ...rest
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
      textColor={textColor}
      {...rest}
    >
      {children}
    </StyledText>
  );
};
