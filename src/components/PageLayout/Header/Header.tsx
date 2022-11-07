import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { SearchInput } from '../components/SearchInput';
import { menu, SubmenuItem } from '../../../utils/menuItems';
import {
  LogoStyled,
  CartIconStyled,
  CrossIconStyled,
  ProfileIconStyled,
  BurgerIconStyled,
  HeaderContainer,
  IconContainer,
  MenuButton,
  MenuOverlay,
  NavLink,
  NavList,
  NavListItem,
  Submenu,
  SubmenuListItem,
} from './styles';

type OuterClickCallback = (e: MouseEvent) => void;

interface ListItemProps {
  title: string;
  link?: string;
  submenu?: SubmenuItem[];
}

function ListItem({ title, link, submenu }: ListItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  return (
    <NavListItem onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}>
      <NavLink href={link}>{title}</NavLink>
      {submenu && (
        <Submenu className='submenu-dropdown' isOpen={isSubmenuOpen}>
          {submenu.map((item) => (
            <SubmenuListItem>
              <NavLink href={link}>{item.subtitle}</NavLink>
            </SubmenuListItem>
          ))}
        </Submenu>
      )}
    </NavListItem>
  );
}

function useOuterClick(callback: OuterClickCallback) {
  const callbackRef = useRef<OuterClickCallback>();
  const innerRef = useRef<HTMLUListElement>();

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        innerRef.current &&
        callbackRef.current &&
        !innerRef.current.contains(e.target as Node)
      ) {
        callbackRef.current(e);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return innerRef;
}

function Header(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  // не знаю как хорошо типизировать реф, пока что оставлю any
  const menuRef: any = useOuterClick(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  });
  return (
    <HeaderContainer>
      <LogoStyled />
      <MenuOverlay className={isOpen ? 'active' : ''} />
      <NavList ref={menuRef} className={isOpen ? 'active' : ''}>
        {menu.map(({ title, link, submenu }) => (
          <ListItem title={title} link={link} submenu={submenu} />
        ))}
      </NavList>
      <SearchInput />
      <IconContainer>
        <MenuButton>
          <CartIconStyled />
        </MenuButton>
        <MenuButton>
          <ProfileIconStyled />
        </MenuButton>
        <MenuButton mobile onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <CrossIconStyled /> : <BurgerIconStyled />}
        </MenuButton>
      </IconContainer>
    </HeaderContainer>
  );
}

export default Header;
