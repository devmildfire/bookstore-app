import styled from 'styled-components';
import List from '../../List';

export interface StyledMenuWrapperProps {
  readonly width?: number;
}

export const StyledMenuWrapper = styled.div<StyledMenuWrapperProps>`
  width: ${(props) => (props.width ? `${props.width}px` : 'max-content')};

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
