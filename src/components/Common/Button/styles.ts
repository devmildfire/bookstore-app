import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { Variant } from './types';
import breakPoints from '@/utils/breakPoints';

export interface StyledButtonProps {
  readonly variant: Variant;
}

const smallStyle = css`
  min-width: 245px;
`;

const standardStyle = css`
  min-width: 270px;
`;

const wideStyle = css`
  min-width: 340px;
`;

const styles: Record<Variant, FlattenSimpleInterpolation> = {
  standard: standardStyle,
  wide: wideStyle,
  small: smallStyle,
};

export const StyledButton = styled.button<StyledButtonProps>`
  --button-border-color: var(--main-white-100);
  --button-text-color: var(--main-white-100);
  --button-bg-color: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 60px;
  ${(props) => styles[props.variant]}
  width: max-content;

  background-color: var(--button-bg-color);

  border: 1px solid var(--button-border-color);
  border-radius: 4px;

  color: var(--button-text-color);
  text-decoration: none;

  transition: all 250ms ease-in;

  @media ${breakPoints.sm} {
    min-height: 40px;
  }

  &:focus-visible {
    --button-text-color: var(--main-black);
    --button-border-color: var(--main-white-100);
    --button-bg-color: var(--main-white-100);
  }

  &:hover {
    --button-text-color: var(--main-white-100);
    --button-border-color: var(--main-red-100);
    --button-bg-color: var(--main-red-100);
  }
`;
