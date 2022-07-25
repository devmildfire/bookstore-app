import React from 'react';

import getCurrentYear from '@/utils/getCurrentYear';
import Text from '@/components/Common/Text';
import socials from '@/utils/socials';
import contacts from '@/mocks/contacts';
import {
  CopyrightContainer,
  FooterContact,
  FooterContacts,
  FooterContent,
  FooterCopyright,
  FooterInfo,
  FooterLogo,
  FooterLogoLink,
  FooterLogoText,
  FooterSocials,
  FooterTitle,
  Icon,
  StyleWrapper,
} from './styles';

const Footer = (): React.ReactElement => (
  <StyleWrapper>
    <FooterContent>
      <FooterContacts>
        {contacts.map(({ content, hightLightContent, href }) => (
          <FooterContact component='p' key={href}>
            <a href={href}>
              {content}
              &nbsp;
              <FooterContact component='span' color='red'>
                {hightLightContent}
              </FooterContact>
            </a>
          </FooterContact>
        ))}
      </FooterContacts>
      <FooterInfo>
        <FooterTitle variant='h2_1' fontFamily='sans'>
          <FooterTitle
            component='span'
            variant='h2_1'
            color='red'
            fontFamily='sans'
          >
            Чти
          </FooterTitle>
          во
        </FooterTitle>
        <FooterSocials>
          {socials.map((social) => (
            <li key={social.href}>
              <a href={social.href}>
                <Icon as={social.icon as any} />
              </a>
            </li>
          ))}
        </FooterSocials>
      </FooterInfo>
      <FooterLogoLink
        href='https://russiandino.ru/'
        target='_blank'
        rel='noreferrer'
      >
        <FooterLogo />
        <FooterLogoText>
          <Text component='span' variant='h4_1'>
            Made by
          </Text>
          <Text component='span' variant='h4_1'>
            Russkiy
          </Text>
          <Text component='span' variant='h4_1'>
            Dinozavr
          </Text>
        </FooterLogoText>
      </FooterLogoLink>
    </FooterContent>
    <FooterCopyright>
      <CopyrightContainer>
        <Text variant='h4_3' component='p'>
          © 2017-
          {getCurrentYear()}
          &nbsp;
          <Text component='span' variant='h4_3' color='red'>
            Чти
          </Text>
          во. Санкт-Петербург. Все права защищены.
        </Text>
      </CopyrightContainer>
    </FooterCopyright>
  </StyleWrapper>
);

export default Footer;
