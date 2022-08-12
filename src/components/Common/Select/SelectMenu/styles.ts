import styled from 'styled-components';
import LoadingIndicator from '../../LoadingIndicator';
import Menu from '../../Menu';

export interface StyledMenuProps {
  readonly width?: number;
}

export const StyledMenu = styled(Menu)<StyledMenuProps>`
  width: ${(props) => (props.width ? `${props.width}px` : 'max-content')};
  max-height: 350px;

  padding-left: 18px;
  padding-right: 18px;

  background-color: var(--main-black);
`;

export const StyledLoadingIndicator = styled(LoadingIndicator)`
  width: 40px;
  height: 40px;

  margin: 0 auto;
`;
