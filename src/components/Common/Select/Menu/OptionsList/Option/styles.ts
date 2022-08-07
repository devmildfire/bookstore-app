import styled from 'styled-components';

export const StyledOption = styled.li`
  background-color: inherit;

  color: var(--main-white);

  &.active {
    color: var(--main-red-100);
  }

  cursor: pointer;
`;
