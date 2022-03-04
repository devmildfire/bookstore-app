import React from 'react';

import styled from 'styled-components';
import colors from '../../utils/colors';
import Logo from '../../assets/icons/footer-logo.svg';
import Insta from '../../assets/icons/footer-insta.svg';
import Telegram from '../../assets/icons/footer-telegram.svg';
import Vk from '../../assets/icons/footer-vk.svg';
import Fb from '../../assets/icons/footer-facebook.svg';
import Twitter from '../../assets/icons/footer-twitter.svg';
import breakPoints from '../../utils/breakPoints';
import getCurrentYear from '../../utils/getCurrentYear';

const Footer = (): React.ReactElement => (
  <StyleWrapper>
    <FooterContent>
      <FooterContacts>
        <a href='tel:+78129158367'>
          Тел.&nbsp;
          <span>
            (812) 915-83-67
          </span>
        </a>
        <a
          href='mailto:info@chtivo.spb.ru'
          target='_top'
        >
          E-mail&nbsp;
          <span>
            info@chtivo.spb.ru
          </span>
        </a>
      </FooterContacts>
      <FooterInfo>
        <FooterTitle>
          <span>Чти</span>
          <span>во</span>
        </FooterTitle>
        <FooterSocials>
          <SocialItem>
            <a
              href='https://instagram.com'
              target='_blank'
              rel='noreferrer'
            >
              <IconInsta />
            </a>
          </SocialItem>
          <SocialItem>
            <a
              href='http://t.me.com'
              target='_blank'
              rel='noreferrer'
            >
              <IconTelegram />
            </a>
          </SocialItem>
          <SocialItem>
            <a
              href='https://vk.com'
              target='_blank'
              rel='noreferrer'
            >
              <IconVk />
            </a>
          </SocialItem>
          <SocialItem>
            <a
              href='https://facebook.com'
              target='_blank'
              rel='noreferrer'
            >
              <IconFb />
            </a>
          </SocialItem>
          <SocialItem>
            <a
              href='https://twitter.com'
              target='_blank'
              rel='noreferrer'
            >
              <IconTwitter />
            </a>
          </SocialItem>
        </FooterSocials>
      </FooterInfo>
      <FooterLogoLink
        href='https://russiandino.ru/'
        target='_blank'
        rel='noreferrer'
      >
        <FooterLogo />
        <FooterLogoText>
          <span>Made by</span>
          <span>Russkiy</span>
          <span>Dinozavr</span>
        </FooterLogoText>
      </FooterLogoLink>
    </FooterContent>
    <FooterCopyright>
      <CopyrightContainer>
        <span>
          © 2017-
          {getCurrentYear}
          &nbsp;
          <span>Чти</span>
          во. Санкт-Петербург. Все права защищены.
        </span>
      </CopyrightContainer>
    </FooterCopyright>
  </StyleWrapper>
);

export default Footer;

const StyleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid red;
  color: ${colors.whiteBase};  
`;

const FooterContent = styled.div`
  padding: 30px 20px 40px;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  width: 100%;
  max-width: 1394px;
  
  @media ${breakPoints.xl} {
    max-width: 1024px;
  }
  
  @media ${breakPoints.lg} {
    max-width: 768px;
  }
  
  @media ${breakPoints.md} {
    max-width: 576px;
    flex-wrap: wrap;    
    align-items: center;
  }
  
  @media ${breakPoints.sm} {    
    flex-direction: column;
    padding: 10px 0 25px;
  }
`;

const FooterContacts = styled.div`
  padding-top: 64px;
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  
  a:first-child {
    margin-bottom: 20px;
  }
  
  span:last-child {
    color: ${colors.red};
  }
  
  @media ${breakPoints.md} {
    padding: 0;
  }
  
  @media ${breakPoints.sm} {
    text-align: center;
    margin-bottom: 30px;
  }
`;

const FooterInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media ${breakPoints.md} {
    width: 100%;
    order: -1;
    margin-bottom: 20px;
  }
`;

const FooterTitle = styled.h2`
  margin-bottom: 15px;
  font-weight: 700;
  font-size: 57px;
  line-height: 69px;
  
  span:first-child {
    color: ${colors.red};
  }
  
  @media ${breakPoints.sm} {
    font-size: 40px;
    line-height: 49px;
  }
`;

const FooterSocials = styled.ul`
  display: flex;
  align-items: center;
`;

const SocialItem = styled.li`

  :not(:last-child) {
    margin-right: 30px;
  }
`;

const IconInsta = styled(Insta)`
  transition: fill .3s ease-in-out;
 
 :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
 }
`;

const IconTelegram = styled(Telegram)`
  transition: fill .3s ease-in-out;
 
 :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
 }
`;

const IconVk = styled(Vk)`
  transition: fill .3s ease-in-out;
 
 :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
 }
`;

const IconFb = styled(Fb)`
  transition: fill .3s ease-in-out;
 
 :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
 }
`;

const IconTwitter = styled(Twitter)`
  transition: fill .3s ease-in-out;
 
 :hover {
    fill: ${colors.redBase};
    transition: fill .3s ease-in-out;
 }
`;

const FooterLogoLink = styled.a`
  margin-top: 56px;
  display: flex;
  
  @media ${breakPoints.md} {
    margin: 0;
  }
`;

const FooterLogo = styled(Logo)`
  margin-right: 17px;
`;

const FooterLogoText = styled.p`  
  span {
    display: block;    
    font-weight: 600;
    font-size: 20px;
    line-height: 26px; 
  }
  
  span:first-child {
    font-size: 15px; 
    line-height: 20px;
  }
`;

const FooterCopyright = styled.div`
  padding: 15px 0;
  font-size: 12px;
  line-height: 15px;
  font-feature-settings: 'salt' on, 'liga' off;
  border-top: 1px solid rgba(220, 220, 220, 0.2);
  color: ${colors.whiteBase};
  
  span span {
    color: ${colors.red};
  }
  
  @media ${breakPoints.sm} {
     padding: 10px 0;
    font-size: 8px;
    line-height: 10px;
  }
`;

const CopyrightContainer = styled.div`
  max-width: 1394px;
  margin: 0 auto;
  padding: 0 20px;
  
  
  @media ${breakPoints.xl} {
    max-width: 1024px;
  }
  
  @media ${breakPoints.lg} {
    max-width: 768px;
  }
  
  @media ${breakPoints.md} {
    max-width: 576px;
  }
`;
