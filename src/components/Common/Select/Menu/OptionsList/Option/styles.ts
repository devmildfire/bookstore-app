import styled from 'styled-components';

export const StyledOption = styled.li`
  background-color: inherit;

  :hover,
  &.active {
    color: var(--main-red-100);
  }

  cursor: pointer;
`;
