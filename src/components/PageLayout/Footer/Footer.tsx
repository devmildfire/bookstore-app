import React from 'react';

import getCurrentYear from '@/utils/getCurrentYear';
import Text from '@/components/Common/Text';
import socials from '@/utils/socials';
import contacts from '@/mocks/contacts';
import {
  CopyrightContainer,
  FooterContact,
  FooterContactLink,
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
  ContactIcon,
  StyleWrapper,
} from './styles';

const Footer = (): React.ReactElement => (
  <StyleWrapper>
    <FooterContent>
      <FooterContacts>
        {contacts.map((contact) => (
          <FooterContact key={contact.href}>
            <FooterContactLink href={contact.href}>
              <ContactIcon as={contact.icon as any} />
              &nbsp;
              {contact.hightLightContent}
            </FooterContactLink>
          </FooterContact>
        ))}
      </FooterContacts>
      <FooterInfo>
        <FooterTitle fontFamily='sans'>
          <FooterTitle
            component='span'
            // variant='h4_1'
            textColor='red'
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
        <Text
          variant='h4_3'
          component='p'
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <span>
            © 2017-
            {getCurrentYear()}
            &nbsp; Чтиво. Санкт-Петербург. Все права защищены.
          </span>
          <span> #хбдщдбдщ</span>
        </Text>
      </CopyrightContainer>
    </FooterCopyright>
  </StyleWrapper>
);

export default Footer;
