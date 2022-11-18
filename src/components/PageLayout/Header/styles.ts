import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Logo from '@/assets/images/logo.svg';
import CartIcon from '@/assets/icons/cart.svg';
import CrossIcon from '@/assets/icons/close.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import BurgerIcon from '@/assets/icons/burger.svg';

interface HeaderList {
  className: string;
}

interface MenuButtonProps {
  mobile?: boolean;
}

interface SubmenuProps {
  isOpen: boolean;
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

const CrossIconStyled = styled(CrossIcon)`
  width: 13px;
  height: 13px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 320px) {
    width: 14px;
    height: 14px;
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

const HeaderContainer = styled.header`
  --header-height: 80px;
  position: sticky;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  height: var(--header-height);
  z-index: 99999;
  padding: 0 180px;
  background-color: var(--main-black);
  max-width: 1800px;
  width: 100%;
  place-self: center;

  @media ${breakPoints.xl} {
    max-width: auto;
    box-sizing: border-box;
    --header-height: 70px;
    padding: 0 90px;
  }

  @media ${breakPoints.lg} {
    --header-height: 60px;
    padding: 0 20px;
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
  background-color: var(--main-black);
  visibility: visible;
  opacity: 1;
  position: relative;
  width: 55%;
  min-width: 480px;
  @media ${breakPoints.md} {
    width: 50vw;
    min-width: 260px;
    visibility: hidden;
    opacity: 0;
    padding: 10px 20px 60px;
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
  @media screen and (max-width: 1200px) {
    font-size: 14px;
  }
  @media screen and (min-width: 830px) {
    &:hover .submenu-dropdown {
      visibility: visible;
      opacity: 1;
    }
  }
  @media ${breakPoints.md} {
    font-weight: 500;
  }
`;

const NavLink = styled.a`
  &:hover {
    color: var(--main-red-100);
  }
`;

const Submenu = styled.ul<SubmenuProps>`
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: var(--main-black);
  position: absolute;
  top: 28px;
  left: -10px;
  min-width: 160px;
  padding: 12px 12px 24px;
  visibility: hidden;
  opacity: 0;
  transition: 0.4s;
  @media ${breakPoints.md} {
    display: ${(props) => (props.isOpen ? 'flex' : 'none')};
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
  font-size: 12px;
  font-weight: 400;
  color: var(--main-white);
  @media ${breakPoints.md} {
    text-align: end;
  }
`;
const IconContainer = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  align-items: center;
  @media ${breakPoints.md} {
    gap: 12px;
  }
`;

const MenuButton = styled.button<MenuButtonProps>`
  display: ${(props) => (props.mobile ? 'none' : 'flex')};
  background-color: transparent;
  border: none;
  padding: 0;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  @media ${breakPoints.md} {
    display: flex;
  }
`;

const MenuOverlay = styled.div`
  position: absolute;
  top: var(--header-height);
  left: 0;
  width: 100%;
  height: calc(100vh - var(--header-height));
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
  CrossIconStyled,
  ProfileIconStyled,
  BurgerIconStyled,
  HeaderContainer,
  NavList,
  NavListItem,
  NavLink,
  Submenu,
  SubmenuListItem,
  IconContainer,
  MenuButton,
  MenuOverlay,
};
