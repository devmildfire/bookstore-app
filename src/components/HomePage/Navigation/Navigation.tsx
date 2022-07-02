import React from 'react';
import NavigationItem from './NavigationItem';
import { StyledList } from './styles';

interface NavItem {
  readonly path: string;
  readonly label: string;
}

const navigationItems: NavItem[] = [
  {
    label: 'ИЗДАНИЯ',
    path: '/books',
  },
  {
    label: 'БОКС-СЕТЫ',
    path: '/sets',
  },
  {
    label: 'КАРТЫ ДАРОВ',
    path: '/gifts',
  },
  {
    label: 'ЧУДЕСА ПОДПИСКИ',
    path: '/subscription',
  },
];

const Navigation = (): React.ReactElement => (
  <div>
    <StyledList>
      {navigationItems.map((item) => (
        <NavigationItem {...item} key={item.path} />
      ))}
    </StyledList>
  </div>
);

export default Navigation;
