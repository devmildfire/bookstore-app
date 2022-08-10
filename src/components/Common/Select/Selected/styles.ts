import styled from 'styled-components';
import Cross from '@/components/Common/Icons/Cross';

export const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-items: space-between;
  gap: 8px;

  padding: 6px 9px;

  background-color: var(--main-red-50);

  border-radius: 4px;
`;

export const StyledCross = styled(Cross)`
  width: 15px;
  height: 15px;

  fill: var(--main-black);

  :hover,
  :focus-visible {
    fill: var(--main-white-100);
  }
`;
