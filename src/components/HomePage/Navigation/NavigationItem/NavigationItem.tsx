import React, { FC } from 'react';
import NavLink from '@/components/Common/NavLink';
import Text from '@/components/Common/Text';

interface NavigationItemProps {
  readonly path: string;
  readonly label: string;
}

const NavigationItem: FC<NavigationItemProps> = (props) => {
  const { path, label, } = props;

  return (
    <li>
      <Text variant='h4_1' component='span'>
        <NavLink href={path}>{label}</NavLink>
      </Text>
    </li>
  );
};

export default NavigationItem;
