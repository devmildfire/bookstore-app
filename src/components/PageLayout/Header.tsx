import React from 'react';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import styled from 'styled-components';

import HeaderTab, { MenuItem, IHeaderTab } from './components/HeaderTab';

import colors from '../../styles/colors';

const StyledWrapper = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  height: 80px;
  padding: 0 60px;
  background-color: ${colors.black};
  
  @media (max-width: 1440px) {
    padding: 0 40px;
  }

  @media (max-width: 1024px) {
    padding: 0;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${colors.grey70};

  @media (max-width: 1024px) {
    padding: 0 20px;
  }
`;

const books: MenuItem[] = [
  {
    title: 'Издания',
    link: '/all-books',
  },
  {
    title: 'Карты даров',
    link: '/gift-cards',
  },
  {
    title: 'Чудеса подписки',
    link: '/subscription',
  },
  {
    title: 'Журнал Русского Динозавра',
    link: '/dino-magazine',
  },
];

const menu: IHeaderTab[] = [
  {
    title: 'Главная',
    link: '/',
  },
  {
    title: 'Книжная лавка',
    submenu: books,
  },
  {
    title: 'Чтецам',
    link: '/for-readers',
  },
  {
    title: 'Партнёрам',
    link: '/for-partners',
  },
  {
    title: 'О Чтиве',
    link: '/about',
  },
  {
    title: 'Контакты',
    link: '/contacts',
  },
];

const Header = (): React.ReactElement => (
  <StyledWrapper>
    <HeaderContent>
      <Link href='/' passHref>
        <a href='fakeHref'>
          <ReactSVG src='chtivo-logo.svg' />
        </a>
      </Link>
      {menu.map(({ title, link, submenu }) => (
        <HeaderTab
          title={title}
          link={link}
          submenu={submenu}
        />
      ))}
    </HeaderContent>
  </StyledWrapper>
);

export default Header;
