import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { SearchInput } from '../components/SearchInput';
import { menu, SubmenuItem } from '../../../utils/menuItems';
import {
  LogoStyled,
  CartIconStyled,
  CrossIconStyled,
  // ProfileIconStyled,
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
  HeaderWrapper,
} from './styles';
import { useModal } from '@/components/Modal/Modal';
import { SearchIcon } from '@/components/Common/Multiselect/styles';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Leva } from 'leva';

interface ListItemProps {
  title: string;
  link?: string;
  submenu?: SubmenuItem[];
  backgroundColor: string;
}

function ListItem({ title, link, submenu, backgroundColor }: ListItemProps) {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  return (
    <NavListItem onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}>
      <NavLink href={link}>{title}</NavLink>
      {submenu && (
        <Submenu
          backgroundColor={backgroundColor}
          className='submenu-dropdown'
          isOpen={isSubmenuOpen}
        >
          {submenu.map((item) => (
            <SubmenuListItem key={item.subtitle}>
              <NavLink href={item.link}>{item.subtitle}</NavLink>
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
  const [isOpen, setIsOpen] = useState(false);
  const [isInputActive, setIsInputActive] = useState(false);
  const overlayRef = useRef(null);
  const { handleOpenModal } = useModal();

  function handleClick(e: MouseEvent) {
    if (e.target === overlayRef.current) {
      setIsOpen(false);
    }
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
        <LogoStyled />
        <MenuOverlay ref={overlayRef} className={isOpen ? 'active' : ''} />
        <NavList
          className={isOpen ? 'active' : ''}
          backgroundColor={backgroundColor}
        >
          {menu.map(({ title, link, submenu }) => (
            <ListItem
              backgroundColor={backgroundColor}
              key={title}
              title={title}
              link={link}
              submenu={submenu}
            />
          ))}
        </NavList>
        {/* <SearchInput
          isInputActive={isInputActive}
          setIsInputActive={setIsInputActive}
        /> */}
        <IconContainer>
          <MenuButton onClick={() => handleOpenModal(true, 'search')}>
            <MagnifyingGlassIcon />
          </MenuButton>
          <MenuButton isVisible={isInputActive}>
            <CartIconStyled />
          </MenuButton>
          {/* <MenuButton isVisible={isInputActive}>
            <ProfileIconStyled />
          </MenuButton> */}
          <MenuButton mobile onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <CrossIconStyled /> : <BurgerIconStyled />}
          </MenuButton>
        </IconContainer>
      </HeaderContainer>
    </HeaderWrapper>
  );
}

export default Header;
