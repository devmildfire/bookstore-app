import styled from 'styled-components';
import List from '../../List';

export const StyledMenuWrapper = styled.div`
  display: grid;
  gap: 10px;

  width: max-content;

  padding: 0 24px 18px;

  background-color: var(--main-black);
`;

export const StyledSelectedList = styled(List)`
  display: flex;
  flex-wrap: wrap;
`;

export const StyledSelectedItem = styled.li`
  padding: 9px 6px;

  background-color: var(--main-red-50);
`;
