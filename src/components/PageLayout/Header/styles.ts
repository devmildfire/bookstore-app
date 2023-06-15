import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Logo from '@/assets/images/logo.svg';
import CartIcon from '@/assets/icons/cart.svg';

import ProfileIcon from '@/assets/icons/profile.svg';
import BurgerIcon from '@/assets/icons/burger.svg';
import Link from 'next/link';
import { IconButton } from '@/components/Common/IconButton';

interface HeaderList {
  className: string;
  backgroundColor: string;
}

interface MenuButtonProps {
  mobile?: boolean;
  isVisible?: boolean;
}

interface SubmenuProps {
  isOpen: boolean;
  backgroundColor: string;
}

const LogoLinkContainer = styled.div`
  flex-grow: 0;
`;

const LogoStyled = styled(Logo)`
  cursor: pointer;
  height: 32px;
  width: 145px;

  @media (max-width: 1920px) {
    width: 145px;
    height: 32px;
  }

  @media (max-width: 1440px) {
    width: 109px;
    height: 24px;
  }

  @media (max-width: 1024px) {
    width: 84px;
    height: 18px;
  }

  @media (max-width: 320px) {
    width: 54px;
    height: 11px;
  }
`;

const CartIconStyled = styled(CartIcon)`
  width: 28px;
  height: 28px;
  opacity: 0.8;
  stroke-width: 1px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 1920px) {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 1440px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 1024px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 320px) {
    width: 14px;
    height: 14px;
  }
`;

const MenuButton = styled.div`
  display: none;
  @media ${breakPoints.lg} {
    display: block;
  }
`;

const ProfileIconStyled = styled(ProfileIcon)`
  width: 28px;
  height: 28px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 1920px) {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 1440px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 1024px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 320px) {
    width: 14px;
    height: 14px;
  }
`;

const BurgerIconStyled = styled(BurgerIcon)`
  width: 28px;
  height: 28px;

  stroke: var(--main-white-100);
  stroke-width: 1px;

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 1440px) {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 1024px) {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 320px) {
    width: 14px;
    height: 14px;
  }
`;

const HeaderWrapper = styled.header`
  position: sticky;
  top: -1px;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  transition: all 0.2s ease-in-out 0s;
  z-index: 99999;
`;

const HeaderContainer = styled.div`
  --header-height: 80px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  height: var(--header-height);
  max-width: 1440px;
  width: 100%;
  place-self: center;

  @media ${breakPoints.xl} {
    max-width: auto;
    --header-height: 70px;
  }

  @media ${breakPoints.lg} {
    --header-height: 60px;
  }

  @media ${breakPoints.md} {
    --header-height: 58px;
    gap: 0px;
  }
`;

const NavList = styled.ul<HeaderList>`
  display: flex;
  flex-direction: row;
  gap: 12px;
  justify-content: space-evenly;
  visibility: visible;
  opacity: 1;
  position: relative;
  width: 55%;
  min-width: 480px;
  @media ${breakPoints.lg} {
    background-color: ${(props) => props.backgroundColor};
    width: 50vw;
    min-width: 260px;
    visibility: hidden;
    opacity: 0;
    padding: 10px 20px 40px;
    position: absolute;
    top: var(--header-height);
    right: 0;
    flex-direction: column;
    justify-content: flex-start;
    z-index: 99999;
    transition: 0.16s ease-in;
  }

  &.active {
    visibility: visible;
    opacity: 1;
  }
`;

const NavListItem = styled.li`
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: end;
  font-size: 16px;

  @media screen and (min-width: 1024px) {
    &:hover .submenu-dropdown {
      visibility: visible;
      opacity: 1;
    }
  }
`;

const NavLink = styled(Link)`
  &:hover {
    -webkit-text-fill-color: var(--main-red-100);
    color: var(--main-red-100);
  }
`;

const NavItem = styled.span`
  &:hover {
    -webkit-text-fill-color: var(--main-red-100);
    color: var(--main-red-100);
  }
`;

const Submenu = styled.ul<SubmenuProps>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: ${(props) => props.backgroundColor};
  position: absolute;
  top: 28px;
  left: -10px;
  min-width: 160px;
  width: max-content;
  padding: 24px;
  border-radius: 4px;
  visibility: hidden;
  opacity: 0;
  transition: 0.4s;
  box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.25);
  @media ${breakPoints.lg} {
    display: ${(props) => (props.isOpen ? 'flex' : 'none')};
    box-shadow: none;
    width: auto;
    visibility: visible;
    opacity: 1;
    position: relative;
    top: 0;
    left: 0;
    padding: 0;
  }
`;

const SubmenuListItem = styled.li`
  cursor: pointer;
  text-align: start;
  font-size: 14px;
  font-weight: 400;
  color: var(--main-white-60);
  @media ${breakPoints.lg} {
    text-align: end;
  }
`;
const IconContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;

  @media ${breakPoints.md} {
    gap: 4px;
  }
`;

const MenuOverlay = styled.div`
  position: absolute;
  top: var(--header-height);
  left: 0;
  width: 100%;
  /* 
    +1px нужен из-за top:-1px у хедера, 
    который фиксит баг с пустым пространством под футером при ресайзе окна.
  */
  height: calc(100vh - var(--header-height) + 1px);
  background-color: black;
  opacity: 0;
  visibility: hidden;
  transition: 0.22s;
  &.active {
    opacity: 0.8;
    visibility: visible;
  }
`;

export {
  LogoLinkContainer,
  LogoStyled,
  CartIconStyled,
  MenuButton,
  ProfileIconStyled,
  BurgerIconStyled,
  HeaderWrapper,
  HeaderContainer,
  NavList,
  NavListItem,
  NavLink,
  NavItem,
  Submenu,
  SubmenuListItem,
  IconContainer,
  MenuOverlay,
};
