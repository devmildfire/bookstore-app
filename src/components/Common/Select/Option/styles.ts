import styled from 'styled-components';

export const StyledOption = styled.li`
  background-color: inherit;

  color: var(--main-white-100);

  &.active {
    color: var(--main-red-100);
  }

  cursor: pointer;
`;
