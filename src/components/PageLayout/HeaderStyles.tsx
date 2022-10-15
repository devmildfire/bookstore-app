import styled from 'styled-components';
import colors from '@/utils/colors';
import Logo from '@/assets/images/logo.svg';
import CartIcon from '@/assets/icons/cart.svg';
import CrossIcon from '@/assets/icons/close.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import BurgerIcon from '@/assets/icons/burger.svg';

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

interface RedLinkProps {
  readonly isOpen: boolean;
}

const Redlink = styled.a<RedLinkProps>`
  color: ${(props) => (props.isOpen ? colors.redBase : colors.whiteBase70)};
  text-decoration: none;

  :hover {
    color: var(--main-red-100);
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

// const HeaderContentStyled = styled(HeaderContent)`
//   position: relative;
//   display: flex;
//   height: 100%;
//   justify-content: space-between;
//   align-items: center;
//   font-size: 16px;

//   @media (max-width: 1440px) {
//     font-size: 14px;
//     line-height: 17px;
//   }

//   @media (max-width: 1024px) {
//     font-size: 10px;
//     letter-spacing: 0.05em;
//     line-height: 140%;
//   }

//   @media (max-width: 680px) {
//     font-size: 12px;
//     letter-spacing: 0.05em;
//     line-height: 140%;
//   }
// `;

export {
  StyledWrapper,
  IconsContainerStyled,
  LogoLinkContainer,
  LogoStyled,
  CartIconStyled,
  CrossIconStyled,
  ProfileIconStyled,
  Redlink,
  BurgerIconStyled,
};
