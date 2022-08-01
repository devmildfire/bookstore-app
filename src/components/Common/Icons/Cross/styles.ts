import styled from 'styled-components';
import Cross from '@/assets/icons/cross.svg';

export const StyledCross = styled(Cross)`
  display: inline-block;

  width: 33px;
  height: 33px;

  fill: var(--main-white);

  :hover,
  :focus-visible {
    fill: var(--main-red-100);
  }
`;
