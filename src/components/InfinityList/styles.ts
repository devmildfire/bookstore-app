import styled from 'styled-components';
import List from '../Common/List';

export const StyledProductsList = styled(List)`
  position: relative;
`;

interface StyledIntersectingElementProps {
  readonly position: 'top' | 'bottom';
}

export const StyledIntersectingElement = styled.div<StyledIntersectingElementProps>`
  position: absolute;
  ${(props) => props.position}: 0;
  right: 0;
  left: 0;
`;
