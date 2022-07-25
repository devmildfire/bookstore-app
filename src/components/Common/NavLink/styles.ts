import styled from 'styled-components';
import Link, { LinkProps } from '../Link';

export interface StyledNavLinkProps extends LinkProps {
  readonly isActive: boolean;
}

const StyledNavLink = styled(Link)<StyledNavLinkProps>`
  ${(props) => (props.isActive ? 'color: var(--main-red-100);' : '')}
`;

export default StyledNavLink;
