import React, { FC } from 'react';
import NavLink from '@/components/Common/NavLink';
import Text from '@/components/Common/Text';
import { NavItem } from '@/types/navItem';

// interface NavigationItemProps {
//   readonly link: string;
//   readonly title: string;
// }

const NavigationItem: FC<NavItem> = (props) => {
  const { link, title } = props;

  return (
    <li>
      <Text variant='h4_1' component='span'>
        <NavLink href={link}>{title}</NavLink>
      </Text>
    </li>
  );
};


// const NavigationItem: FC<NavigationItemProps> = (props) => {
//   const { link, title } = props;

//   return (
//     <li>
//       <Text variant='h4_1' component='span'>
//         <NavLink href={link}>{title}</NavLink>
//       </Text>
//     </li>
//   );
// };

export default NavigationItem;
