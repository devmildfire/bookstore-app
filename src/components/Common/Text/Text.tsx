import * as React from 'react';

import { ClassNameProps } from '@/types/className';
import StyledText, { StyledTextProps, tagMap } from './styles';

export interface TextProps extends Partial<StyledTextProps>, ClassNameProps {
  readonly component?: keyof React.ReactHTML;
}

export const Text: React.FC<TextProps> = (props) => {
  const {
    children,
    component,
    variant = 'text',
    align = 'inherit',
    color = 'white',
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
      color={color}
      {...rest}
    >
      {children}
    </StyledText>
  );
};
