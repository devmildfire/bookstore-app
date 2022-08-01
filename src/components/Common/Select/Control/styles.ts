import styled from 'styled-components';
import Arrow from '../../Icons/Arrow';
import Text from '../../Text';

export const StyledArrow = styled(Arrow)`
  &.active {
    fill: var(--main-red-100);
  }
`;

export const StyledControls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;

  padding: 18px 24px 0;

  background-color: var(--main-black);

  cursor: pointer;

  outline: none;

  :hover ${StyledArrow}, :focus-visible ${StyledArrow} {
    fill: var(--main-red-100);
  }
`;

export const StyledPlaceholder = styled(Text).attrs({
  variant: 'h4_1',
  component: 'span',
})``;
