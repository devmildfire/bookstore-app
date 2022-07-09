import styled from 'styled-components';

type Size = 'small' | 'medium' | 'large';

export interface StyledIconButtonProps {
  readonly size: Size;
}

const sizeMap: Record<Size, number> = {
  small: 30,
  medium: 40,
  large: 50,
};

export const StyledButton = styled.button<StyledIconButtonProps>`
  display: inline-block;

  width: ${(props) => sizeMap[props.size]}px;
  height: ${(props) => sizeMap[props.size]}px;
  border-radius: 50%;

  background-color: transparent;
`;
