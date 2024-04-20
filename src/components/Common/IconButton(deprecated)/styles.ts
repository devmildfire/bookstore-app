import { ReactElement } from 'react';
import styled from 'styled-components';

type Size = 'small' | 'medium' | 'large';

export interface StyledIconButtonProps {
  readonly size: string;
}

const sizeMap: Record<string, number> = {
  small: 30,
  medium: 40,
  large: 50,
};

export const StyledButton = styled.button<StyledIconButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: ${(props) => sizeMap[props.size]}px;
  height: ${(props) => sizeMap[props.size]}px;

  border-radius: 50%;

  background-color: transparent;
  color: inherit;
  cursor: pointer;
`;
