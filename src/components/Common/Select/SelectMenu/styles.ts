import styled from 'styled-components';
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
