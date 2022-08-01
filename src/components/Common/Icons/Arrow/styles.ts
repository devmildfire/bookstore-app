import styled from 'styled-components';
import Arrow from '@/assets/icons/arrow.svg';

export const StyledArrow = styled(Arrow)`
  display: inline-block;

  width: 11px;
  height: 7px;

  fill: var(--main-white);

  :hover,
  :focus-visible {
    fill: var(--main-red-100);
  }
`;
