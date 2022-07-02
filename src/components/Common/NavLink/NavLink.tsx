import { useRouter } from 'next/dist/client/router';
import React, { FC } from 'react';
import { LinkProps } from '../Link';
import StyledNavLink from './styles';

interface NavLinkProps extends LinkProps {}

const NavLink: FC<NavLinkProps> = (props) => {
  const { href, ...linkProps } = props;
  const { asPath } = useRouter();
  const isActive = asPath === href;

  return <StyledNavLink href={href} isActive={isActive} {...linkProps} />;
};

export default NavLink;
