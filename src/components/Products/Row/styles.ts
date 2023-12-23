import styled from 'styled-components';

export const RowItem = styled.li``;

export const RowContainer = styled.ul`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 2rem;

  @media screen and (max-width: 512px) {
    & {
      justify-content: center;
    }
  }
`;
