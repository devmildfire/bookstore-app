import styled from 'styled-components';
import CrossIcon from '@/assets/icons/cross.svg';
import IconButton from '../IconButton';

export const StyledHeader = styled.header`
  display: flex;
  justify-content: end;

  position: absolute;
  left: 0;
  right: 0;

  z-index: var(--upper-z-index);

  padding: 50px 100px;
`;

export const StyledIconButton = styled(IconButton)`
  order: 10;
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
