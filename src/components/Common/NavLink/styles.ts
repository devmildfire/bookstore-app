import styled from 'styled-components';
import Link, { LinkProps } from '../Link';

export interface StyledNavLinkProps extends LinkProps {
  readonly isActive: boolean;
}

const StyledNavLink = styled(Link)<StyledNavLinkProps>`
  color: var(--${(props) => (props.isActive ? 'red' : 'white')});
`;

export default StyledNavLink;
