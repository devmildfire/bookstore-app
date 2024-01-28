import * as React from 'react';
import NavigationItem from './NavigationItem';
import { StyledList } from './styles';
import { ClassNameProps } from '@/types/className';
import { NavItem } from '@/types/navItem';

interface NavigationProps extends ClassNameProps {
  navigationItems: NavItem[];
}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { className, navigationItems } = props;
  return (
    <StyledList className={className}>
      {navigationItems.map((item) => (
        <NavigationItem {...item} key={item.link} />
      ))}
    </StyledList>
  );
};

export default React.memo(Navigation);
