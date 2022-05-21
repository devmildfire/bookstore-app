import React from 'react';
import styled from 'styled-components';

type Component = 'h2' | 'span' | 'p';
type Align = 'start' | 'center' | 'end' | 'justify';

const fontSizes: Record<string, number> = {
  h2: 90,
  p: 18,
  span: 16,
};
const fontWeights: Record<string, number> = {
  h2: 900,
};
export interface TextProps {
  component?: Component;
  variant?: Component;
  children?: React.ReactText;
  className?: string;
  align?: Align;
}

const StyledText = styled.span`
  line-height: 1.2em;
  font-size: ${(props: TextProps) => fontSizes[props.variant as Component] || 18}px;
  font-weight: ${(props: TextProps) => fontWeights[props.variant as Component] || 400};
  text-align: ${(props: TextProps) => props.align};
`;

const Text = (props: TextProps): React.ReactElement => {
  const {
    children,
    className,
    component = 'span',
    variant = component,
    align = 'start',
  } = props;

  return (
    <StyledText
      as={component}
      align={align}
      variant={variant}
      className={className}
    >
      {children}
    </StyledText>
  );
};

export default Text;
