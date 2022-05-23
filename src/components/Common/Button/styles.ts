import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import breakPoints from '../../../utils/breakPoints';
import { Variant } from './types';

export interface StyledButtonProps {
  readonly rounded: boolean;
  readonly variant: Variant;
}

const squareStyle = css`
  min-width: 70px;
  min-height: 70px;

  @media ${breakPoints.md} {
    min-width: 45px;
    min-height: 45px;
  }
`;

const standardStyle = css`
  min-width: 250px;
  min-height: 70px;

  @media ${breakPoints.md} {
    min-height: 50px;
  }
`;

const wideStyle = css`
  min-width: 320px;
  min-height: 70px;

  @media ${breakPoints.md} {
    min-width: 250px;
    min-height: 50px;
  }
`;

const narrowStyle = css`
  min-width: 150px;
  min-height: 50px;

  @media ${breakPoints.md} {
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

export const StyledBaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;

  border: none;

  text-decoration: none;

  transition: all 0.2s ease-out;

  &:active {
    background-color: transparent;
  }
`;

export const StyledButton = styled(StyledBaseButton)`
  border-radius: ${(props: StyledButtonProps) => (props.rounded ? '4' : '0')}px;

  ${(props: StyledButtonProps) => styles[props.variant]}

  background-color: var(--black);

  color: var(--white);

  &:hover,
  &:active {
    background-color: var(--red);
  }

  &:focus-visible {
    background-color: var(--white);
    border: 1px solid var(--black);
    color: var(--black);
    fill: var(--black);
  }
`;
