import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import { Variant } from './types';

export interface StyledButtonProps {
  readonly rounded: boolean;
  readonly variant: Variant;
}

const squareStyle = css`
  min-width: 70px;
  min-height: 70px;

  @media ${breakPoints.sm} {
    min-width: 45px;
    min-height: 45px;
  }
`;

const standardStyle = css`
  min-width: 250px;
  min-height: 70px;

  @media ${breakPoints.sm} {
    min-height: 50px;
  }
`;

const wideStyle = css`
  min-width: 320px;
  min-height: 70px;

  @media ${breakPoints.sm} {
    min-width: 250px;
    min-height: 50px;
  }
`;

const narrowStyle = css`
  min-width: 150px;
  min-height: 50px;

  @media ${breakPoints.sm} {
    min-width: 120px;
    min-height: 48px;
  }
`;

const styles: Record<Variant, FlattenSimpleInterpolation> = {
  square: squareStyle,
  standard: standardStyle,
  wide: wideStyle,
  narrow: narrowStyle,
};

export const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${(props: StyledButtonProps) => styles[props.variant]}
  width: max-content;

  background-color: var(--black);

  border: 1px solid var(--borderColor);
  border-radius: ${(props: StyledButtonProps) => (props.rounded ? '4' : '0')}px;

  text-decoration: none;

  transition: all 0.2s ease-out;

  color: var(--white);

  &:hover,
  &:active {
    background-color: var(--hoverBG);
    color: var(--hoverColor);
    fill: var(--hoverColor);
    border-color: var(--hoverBorderColor);
  }

  &:focus-visible {
    background-color: var(--white);
    border: 1px solid var(--black);
    color: var(--black);
    fill: var(--black);
  }

  &.outlined {
    --borderColor: var(--white);
    --hoverBG: var(--black);
    --hoverColor: var(--red);
    --hoverBorderColor: rgb(220 220 220 / 50%);
  }

  &.filled {
    --borderColor: transparent;
    --hoverBG: var(--red);
    --hoverColor: var(--white);
    --hoverBorderColor: transparent;
  }
`;
