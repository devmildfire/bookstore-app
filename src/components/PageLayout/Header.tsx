import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Input } from './components/Input';
import colors from '@/utils/colors';
import { menu, SubmenuItem } from '../../utils/menuItems';
import {
  StyledWrapper,
  IconsContainerStyled,
  LogoLinkContainer,
  LogoStyled,
  CartIconStyled,
  CrossIconStyled,
  ProfileIconStyled,
  Redlink,
  BurgerIconStyled,
} from './HeaderStyles';
// import { List } from 'reselect/es/types';

interface HeaderContentProps {
  className?: string;
}

function HeaderContent({ className }: HeaderContentProps) {
  const { render, mobileMenuOpen } = useMenuToggleIcon();
  return (
    <div className={className}>
      <LogoLinkContainer>
        <Link href='/' passHref>
          <a href='fakePath'>
            <LogoStyled />
          </a>
        </Link>
      </LogoLinkContainer>

      <HeaderMenuStyled {...{ mobileMenuOpen }} />

      <Input />

      <IconsContainerStyled>
        <CartIconStyled />
        <ProfileIconStyled />

        {/* функция выводит иконку для мобильного меню */}
        {render}
      </IconsContainerStyled>
    </div>
  );
}

const HeaderContentStyled = styled(HeaderContent)`
  position: relative;
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  letter-spacing: 0.05em;

  @media (max-width: 1440px) {
    font-size: 14px;
    line-height: 17px;
  }

  @media (max-width: 1024px) {
    font-size: 10px;
    letter-spacing: 0.05em;
    line-height: 140%;
  }

  @media (max-width: 747px) {
    font-size: 12px;
    letter-spacing: 0.05em;
    line-height: 140%;
  }
`;

interface HeaderMenuProps {
  className?: string;
}

function HeaderMenu({ className }: HeaderMenuProps) {
  return (
    <div className={className}>
      {menu.map((item) => {
        return <NavItemStyled text={item.title} submenu={item.submenu} />;
      })}
    </div>
  );
}

interface HeaderMenuStyledProps {
  mobileMenuOpen?: boolean;
}

const HeaderMenuStyled = styled(HeaderMenu)<HeaderMenuStyledProps>`
  background-color: ${colors.blackBase};

  display: flex;
  justify-content: space-evenly;

  align-items: center;
  flex-grow: 1;

  @media screen and (min-width: 748px) {
    height: 100%;
  }

  @media screen and (max-width: 747px) {
    display: ${(props) => (props.mobileMenuOpen ? 'flex' : 'none')};
    box-sizing: border-box;
    position: absolute;
    flex-direction: column;

    --mobile-width: 209px;

    width: var(--mobile-width);
    top: 100%;
    left: calc(
      100vw - var(--mobile-width) - 1 * (16px + (100vw - 320px) * 0.03409)
    );
    align-items: end;

    /* padding: 4.5px 17.5px; */
    padding-top: 20px;
    padding-bottom: 20px;
    padding-left: 17.5px;
    padding-right: 17.5px;
    gap: 16px;
  }

  @media screen and (max-width: 320px) {
    left: calc(100vw - 16px - var(--mobile-width));
  }
`;

interface NavItemProps {
  className?: string;
  text?: string;
  submenu?: SubmenuItem[];
}

function NavItem({ className, text, submenu }: NavItemProps) {
  const [open, setOpen] = useState(false);

  function clickOut(ref: React.RefObject<HTMLElement>) {
    //  test if clicks have the same target, not the "outside"
    useEffect(() => {
      // function handleClickOutside(event: React.MouseEvent<HTMLElement>) {
      function handleClickOutside(this: Document, ev: MouseEvent) {
        if (ref.current && !ref.current.contains(ev.target as Node)) {
          setOpen(false);
        }
      }

      // add event listener for clicks on the window
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        // remove event listener
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref]);
  }

  const btnRef = useRef(null);
  clickOut(btnRef);

  return (
    <div className={className} ref={btnRef}>
      <Redlink
        isOpen={!!submenu && open}
        href='#'
        onClick={() => setOpen(!open)}
      >
        {!submenu && text}
        {submenu && !open && `\u25B6 ${text}`}
        {submenu && open && `\u25BC ${text}`}
      </Redlink>

      {submenu && open && (
        <div className='nav-div'>
          {submenu.map((item) => {
            return (
              <a
                href={item.link || '#'}
                className='icon-button'
                onClick={() => setOpen(!open)}
              >
                {item.subtitle}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

const NavItemStyled = styled(NavItem)`
  position: relative;
  display: flex;
  flex-direction: column;

  div,
  .nav-div {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;

    position: absolute;
    overflow: hidden;
    background: ${colors.blackBase};

    top: 100%;
    left: -24px;

    width: 198px;
    gap: 12px;
    padding: 24px 24px;

    @media (max-width: 1920px) {
      --div-width: calc(179px + (100vw - 1440px) * 0.03958);
      width: var(--div-width);
      --div-padding-v: calc(20px + (100vw - 1440px) * 0.00833);
      --div-padding-h: calc(20px + (100vw - 1440px) * 0.00833);
      padding: var(--div-padding-v) var(--div-padding-h);
      left: calc(-1 * var(--div-padding-h));
      --div-gap: calc(10px + (100vw - 1440px) * 0.00416);
      gap: var(--div-gap);
    }

    @media (max-width: 1440px) {
      --div-width: calc(147px + (100vw - 1024px) * 0.07692);
      width: var(--div-width);
      --div-padding-v: calc(13px + (100vw - 1024px) * 0.01682);
      padding: var(--div-padding-v) 20px;
      left: -20px;
      --div-gap: calc(8px + (100vw - 1024px) * 0.0048);
      gap: var(--div-gap);
    }

    @media (max-width: 1024px) {
      width: 147px;
      --div-padding-v: calc(8px + (100vw - 320px) * 0.0071);
      padding: var(--div-padding-v) 20px;
      left: -20px;
      gap: 8px;
    }

    @media (max-width: 747px) {
      position: relative;
      text-align: end;
      left: 0px;
      padding: 4px 20px;
      align-items: flex-end;
      font-size: 10px;
    }

    a {
      :hover {
        color: var(--main-red-100);
      }
      text-decoration: none;
      color: ${colors.whiteBase70};
    }
  }

  a {
    :hover {
      color: var(--main-red-100);
    }
    text-decoration: none;

    @media (max-width: 747px) {
      text-align: end;
      align-self: end;
    }
  }
`;

function useMenuToggleIcon() {
  const [mobileMenuOpen, setMobileMenuOpem] = useState(false);
  return {
    mobileMenuOpen,
    render: mobileMenuOpen ? (
      <CrossIconStyled onClick={() => setMobileMenuOpem(!mobileMenuOpen)} />
    ) : (
      <BurgerIconStyled onClick={() => setMobileMenuOpem(!mobileMenuOpen)} />
    ),
  };
}

const Header = (): React.ReactElement => (
  <StyledWrapper>
    <HeaderContentStyled />
  </StyledWrapper>
);

export default Header;
