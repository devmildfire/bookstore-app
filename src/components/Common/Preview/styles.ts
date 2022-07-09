import styled from 'styled-components';
import CrossIcon from '@/assets/icons/cross.svg';
import IconButton from '../IconButton';
import Container from '../Container';

export const StyledWrapper = styled(Container)`
  position: relative;

  width: min(100vw, var(--max-width));
  margin: 0 auto;

  background-color: var(--key);
`;

export const StyledIconButton = styled(IconButton)`
  position: absolute;

  top: 52px;
  right: 110px;

  z-index: var(--controls-z-index);
`;

export const StyledCrossIcon = styled(CrossIcon)`
  width: 100%;
  height: 100%;

  fill: var(--main-white);

  &:focus-visible,
  &:hover {
    fill: var(--grey);
  }
`;
