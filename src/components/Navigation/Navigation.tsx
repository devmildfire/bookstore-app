import * as React from 'react';
// import Container from '@/components/Common/Container';
import NavigationItem from './NavigationItem';
import { StyledList } from './styles';
import { ClassNameProps } from '@/types/className';
import { NavItem } from '@/types/navItem';

// const navigationItems: NavItem[] = [
//   {
//     label: 'ИЗДАНИЯ',
//     path: '/books',
//   },
//   {
//     label: 'БОКС-СЕТЫ',
//     path: '/sets',
//   },
//   {
//     label: 'КАРТЫ ДАРОВ',
//     path: '/gifts',
//   },
//   {
//     label: 'ЧУДЕСА ПОДПИСКИ',
//     path: '/subscription',
//   }
// ];

interface NavigationProps extends ClassNameProps {
  navigationItems: NavItem[];
}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { className, navigationItems } = props;
  return (
    // <Container className={className}>
    //   <StyledList>
    //     {navigationItems.map((item) => (
    //       <NavigationItem {...item} key={item.path} />
    //     ))}
    //   </StyledList>
    // </Container>

    <StyledList className={className}>
      {navigationItems.map((item) => (
        <NavigationItem {...item} key={item.link} />
      ))}
    </StyledList>
  );
};

export default React.memo(Navigation);
