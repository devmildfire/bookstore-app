import styled from 'styled-components';
import IconButton from '../../IconButton';
import Text from '../../Text';

export const StyledIconButton = styled(IconButton)`
  color: var(--main-white-100);

  :hover,
  :focus-visible {
    color: var(--main-red-100);
  }

  &.active {
    color: var(--main-red-100);
  }
`;

export const StyledControls = styled.div`
  display: flex;
  align-items: center;

  padding: 18px 24px 0;

  background-color: var(--main-black);

  cursor: pointer;

  outline: none;

  :hover ${StyledIconButton}, :focus-visible ${StyledIconButton} {
    color: var(--main-red-100);
  }
`;

export const StyledPlaceholder = styled(Text).attrs({
  variant: 'h4_1',
  component: 'span',
})`
  padding: 0 10px;
`;
