import styled from 'styled-components';
import List from '../Common/List';
import LoadingIndicator from '../Common/LoadingIndicator';

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

export const StyledLoadingIndicator = styled(LoadingIndicator)`
  margin: 0 auto;
`;
