import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { Variant } from './types';

export interface StyledButtonProps {
  readonly variant: Variant;
}

const standardStyle = css`
  min-width: 270px;
`;

const wideStyle = css`
  min-width: 340px;
`;

const styles: Record<Variant, FlattenSimpleInterpolation> = {
  standard: standardStyle,
  wide: wideStyle,
};

export const StyledButton = styled.button<StyledButtonProps>`
  --button-border-color: var(--main-white);
  --button-text-color: var(--main-white);
  --button-bg-color: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 50px;
  ${(props) => styles[props.variant]}
  width: max-content;

  background-color: var(--button-bg-color);

  border: 1px solid var(--button-border-color);
  border-radius: 4px;

  color: var(--button-text-color);
  text-decoration: none;

  transition: all 0.2s ease-out;

  &:focus-visible {
    --button-text-color: var(--main-black);
    --button-border-color: var(--main-white);
    --button-bg-color: var(--main-white);
  }

  &:hover {
    --button-text-color: var(--main-white);
    --button-border-color: var(--main-red-100);
    --button-bg-color: var(--main-red-100);
  }
`;
