import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Logo from '@/assets/images/logo.svg';
// import SearchIcon from '@/assets/icons/search.svg';
import CartIcon from '@/assets/icons/cart.svg';
// import SignOutIcon from '@/assets/icons/sign-out.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import BurgerIcon from '@/assets/icons/burger.svg';
import CrossIcon from '@/assets/icons/close.svg';
import { Input } from './components/Input';
import colors from '@/utils/colors';
// import { menu } from '@/utils/menuItems';
import { menu } from '../../utils/menuItems';

const StyledWrapper = styled.header`
  width: 100%;
  position: sticky;
  box-sizing: border-box;
  top: 0;
  height: var(--header-height);
  padding: 0 60px;
  background-color: ${colors.blackBase};
  z-index: var(--up-z-index);

  @media (max-width: 1920px) {
    --header-height: calc(70px + (100vw - 1440px) * 0.02083);
    --header-padding: calc(50px + (100vw - 1440px) * 0.02083);
    padding: 0 var(--header-padding);
  }

  @media (max-width: 1440px) {
    --header-height: calc(60px + (100vw - 1024px) * 0.02403);
    --header-padding: calc(40px + (100vw - 1024px) * 0.02403);
    padding: 0 var(--header-padding);
  }

  @media (max-width: 1024px) {
    --header-height: calc(36px + (100vw - 320px) * 0.03409);
    --header-padding: calc(16px + (100vw - 320px) * 0.03409);
    padding: 0 var(--header-padding);
  }

  @media (max-width: 320px) {
    --header-height: 36px;
    padding: 0 16px;
  }
`;

function HeaderContent({ className }) {
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

  @media (max-width: 1440px) {
    font-size: 14px;
    line-height: 17px;
  }

  @media (max-width: 1024px) {
    font-size: 10px;
    letter-spacing: 0.05em;
    line-height: 140%;
  }

  @media (max-width: 680px) {
    font-size: 12px;
    letter-spacing: 0.05em;
    line-height: 140%;
  }
`;

function HeaderMenu({ className }) {
  return (
    <div className={className}>
      {menu.map((item) => {
        return <NavItemStyled text={item.title} submenu={item.submenu} />;
      })}
    </div>
  );
}

const HeaderMenuStyled = styled(HeaderMenu)`
  background-color: ${colors.blackBase};

  display: flex;
  justify-content: space-around;

  align-items: center;
  flex-grow: 1;

  @media screen and (min-width: 681px) {
    height: 100%;
  }

  @media screen and (max-width: 680px) {
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

    padding: 4.5px 17.5px;
    gap: 8px;
  }

  @media screen and (max-width: 320px) {
    left: calc(100vw - 16px - var(--mobile-width));
  }
`;

const IconsContainerStyled = styled.div`
  display: flex;
  height: 100%;
  justify-content: space-around;
  align-items: center;

  flex-grow: 0.5;
  max-width: 100px;

  @media screen and (max-width: 680px) {
    justify-content: space-between;
  }
`;

const LogoLinkContainer = styled.div`
  flex-grow: 0;
`;

const LogoStyled = styled(Logo)`
  cursor: pointer;
  height: 32px;
  width: 145px;

  @media (max-width: 1920px) {
    --logo-width: calc(109px + (100vw - 1440px) * 0.075);
    width: var(--logo-width);
    --logo-height: calc(var(--logo-width) * 0.2037);
    height: var(--logo-height);
  }

  @media (max-width: 1440px) {
    --logo-width: calc(84px + (100vw - 1024px) * 0.06009);
    width: var(--logo-width);
    --logo-height: calc(var(--logo-width) * 0.2037);
    height: var(--logo-height);
  }

  @media (max-width: 1024px) {
    --logo-width: calc(54px + (100vw - 320px) * 0.04261);
    width: var(--logo-width);
    --logo-height: calc(var(--logo-width) * 0.2037);
    height: var(--logo-height);
  }

  @media (max-width: 320px) {
    --logo-width: 54px;
    width: var(--logo-width);
    --logo-height: calc(var(--logo-width) * 0.2037);
    height: var(--logo-height);
  }
`;

const CartIconStyled = styled(CartIcon)`
  width: 32px;
  height: 32px;
  opacity: 0.8;
  stroke-width: 1px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 1920px) {
    --cart-width: calc(23px + (100vw - 1440px) * 0.01875);
    width: var(--cart-width);
    height: var(--cart-width);
  }

  @media (max-width: 1440px) {
    --cart-width: calc(18px + (100vw - 1024px) * 0.01202);
    width: var(--cart-width);
    height: var(--cart-width);
  }

  @media (max-width: 1024px) {
    --cart-width: calc(14px + (100vw - 320px) * 0.00568);
    width: var(--cart-width);
    height: var(--cart-width);
  }

  @media (max-width: 320px) {
    --cart-width: 14px;
    width: var(--cart-width);
    height: var(--cart-width);
  }
`;

const CrossIconStyled = styled(CrossIcon)`
  width: 12px;
  height: 12px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (min-width: 681px) {
    display: none;
  } ;
`;

const ProfileIconStyled = styled(ProfileIcon)`
  width: 26px;
  height: 28px;

  stroke: var(--main-white-100);

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media (max-width: 1920px) {
    --profile-width: calc(21px + (100vw - 1440px) * 0.01041);
    width: var(--profile-width);
    height: calc(var(--profile-width) + 2);
  }

  @media (max-width: 1440px) {
    --profile-width: calc(17px + (100vw - 1024px) * 0.00961);
    width: var(--profile-width);
    height: calc(var(--profile-width) + 1);
  }

  @media (max-width: 1024px) {
    --profile-width: calc(12px + (100vw - 320px) * 0.0071);
    width: var(--profile-width);
    height: calc(var(--profile-width) + 1);
  }

  @media (max-width: 320px) {
    --profile-width: 12px;
    width: 12px;
    height: 13px;
  }
`;

const BurgerIconStyled = styled(BurgerIcon)`
  width: 20px;
  height: 12px;

  stroke: var(--main-white-100);
  stroke-width: 1px;

  cursor: pointer;

  :hover {
    stroke: var(--main-red-100);
  }

  @media screen and (min-width: 680px) {
    display: none;
  }
`;

const Redlink = styled.a`
  color: ${(props) => (props.isOpen ? colors.redBase : colors.whiteBase70)};
  text-decoration: none;

  :hover {
    color: var(--main-red-100);
  }
`;

function NavItem({ className, text, submenu }) {
  const [open, setOpen] = useState(false);

  function clickOut(ref) {
    //  test if clicks have the same target, not the "outside"
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setOpen(false);
          // console.log(event);
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
      <Redlink isOpen={open && submenu} href='#' onClick={() => setOpen(!open)}>
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

    @media (max-width: 680px) {
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

    @media (max-width: 680px) {
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
