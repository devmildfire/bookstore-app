import styled from 'styled-components';
import CrossIcon from '@/assets/icons/cross.svg';
import IconButton from '../IconButton';

export const StyledWrapper = styled.div`
  position: relative;
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
