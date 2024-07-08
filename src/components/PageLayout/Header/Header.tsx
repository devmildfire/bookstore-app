import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { menu, SubmenuItem } from '../../../utils/menuItems';
import {
  LogoStyled,
  // CartIconStyled,
  // ProfileIconStyled,
  MenuButton,
  // BurgerIconStyled,
  HeaderContainer,
  IconContainer,
  MenuOverlay,
  NavLink,
  NavList,
  NavListItem,
  Submenu,
  SubmenuListItem,
  HeaderWrapper,
  NavItem,
} from './styles';
import CrossIcon from '@/assets/icons/ui-icons/close.svg';
import SearchIcon from '@/assets/icons/ui-icons/search.svg';
import CartIcon from '@/assets/icons/ui-icons/cart.svg';
import BurgerIcon from '@/assets/icons/burger.svg';
import { useModal } from '@/components/Modal/Modal';
import Link from '@/components/Common/Link/Link';
import { IconButton } from '@/components/Common/IconButton';
import { useRouter } from 'next/router';

interface ListItemProps {
  title: string;
  link?: string;
  submenu?: SubmenuItem[];
  backgroundColor: string;
  onClick: () => void;
}

function ListItem({
  title,
  link,
  submenu,
  backgroundColor,
  onClick,
}: ListItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  return (
    <NavListItem onClick={() => setIsSubmenuOpen((prev) => !prev)}>
      {link ? (
        <NavLink onClick={onClick} href={link}>
          {title}
        </NavLink>
      ) : (
        <NavItem>{title}</NavItem>
      )}
      {submenu && (
        <Submenu
          backgroundColor={backgroundColor}
          className='submenu-dropdown'
          isOpen={isSubmenuOpen}
        >
          {submenu.map((item) => (
            <SubmenuListItem key={item.subtitle}>
              <NavLink
                onClick={onClick}
                href={item.link}
                target={item.newTab ? '_blank' : '_self'}
              >
                {item.subtitle}
              </NavLink>
            </SubmenuListItem>
          ))}
        </Submenu>
      )}
    </NavListItem>
  );
}

type Color = string;

function Header({
  backgroundColor = 'var(--main-black)',
}: {
  backgroundColor?: Color;
}): ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef(null);
  const { handleOpenModal } = useModal();

  function handleClick(e: MouseEvent) {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
  }

  function close() {
    setIsOpen(false);
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  return (
    <HeaderWrapper style={{ backgroundColor }} className='max-width'>
      <HeaderContainer>
        <Link href='/books'>
          <LogoStyled />
        </Link>
        <MenuOverlay ref={overlayRef} className={isOpen ? 'active' : ''} />
        <NavList
          className={isOpen ? 'active' : ''}
          backgroundColor={backgroundColor}
        >
          {menu.map(({ title, link, submenu }) => (
            <ListItem
              onClick={close}
              backgroundColor={backgroundColor}
              key={title}
              title={title}
              link={link}
              submenu={submenu}
            />
          ))}
        </NavList>

        <IconContainer>
          <IconButton
            label='поиск'
            onClick={() => handleOpenModal(true, 'search')}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            label='корзина'
            onClick={() => router.push('/cart')}
            negMargin={14}
          >
            {/* FIXME(@sergromm): нужно сделать выровненный набор иконок в фигме или использовать готовые.
             Сейчас иконки визуально не выровнены из-за разного 'визуального веса' */}
            <CartIcon />
            {/* <CartIconNM /> */}
          </IconButton>
          <MenuButton negMargin={11}>
            <IconButton
              label={isOpen ? 'закрыть' : 'меню'}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {isOpen ? <CrossIcon /> : <BurgerIcon />}
            </IconButton>
          </MenuButton>
        </IconContainer>
      </HeaderContainer>
    </HeaderWrapper>
  );
}

export default Header;
