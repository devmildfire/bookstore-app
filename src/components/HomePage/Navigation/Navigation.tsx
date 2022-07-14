import * as React from 'react';
import Container from '@/components/Common/Container';
import NavigationItem from './NavigationItem';
import { StyledList } from './styles';
import { ClassNameProps } from '@/types/className';

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

const Navigation: React.FC<ClassNameProps> = (props) => {
  const { className } = props;
  return (
    <Container className={className}>
      <StyledList>
        {navigationItems.map((item) => (
          <NavigationItem {...item} key={item.path} />
        ))}
      </StyledList>
    </Container>
  );
};

export default React.memo(Navigation);
