import React, { FC } from 'react';
import NavLink from '@/components/Common/NavLink';

interface NavigationItemProps {
  readonly path: string;
  readonly label: string;
}

const NavigationItem: FC<NavigationItemProps> = (props) => {
  const { path, label } = props;

  return (
    <li>
      <NavLink href={path}>{label}</NavLink>
    </li>
  );
};

export default NavigationItem;
