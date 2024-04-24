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
  FooterWrapper,
} from './styles';
import Link from 'next/link';

const Footer = (): React.ReactElement => (
  <StyleWrapper>
    <FooterContent className='max-width'>
      <FooterWrapper>
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
            <FooterTitle component='span' textColor='red' fontFamily='sans'>
              Чти
            </FooterTitle>
            во
          </FooterTitle>
          <FooterSocials>
            {socials.map((social) => (
              <li key={social.href}>
                <a href={social.href}>
                  <Icon as={social.icon} />
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
      </FooterWrapper>
    </FooterContent>
    <FooterCopyright>
      <CopyrightContainer>
        <Text
          variant='h4_3'
          component='p'
          // style={{ display: 'flex', justifyContent: 'space-between' }}
          className='flex flex-col justify-center text-center gap-3 sm:flex-row sm:justify-between'
        >
          <span className='text-center sm:text-left'>
            © 2017-
            {getCurrentYear()}
            &nbsp; Чтиво. Санкт-Петербург. Все права защищены.
          </span>
          <Link
            href={`/docs/oferta.pdf`}
            target='_blank'
            rel='noreferrer'
            className='text-center text-mainred sm:text-left hover:underline hover:text-red duration-300'
          >
            Оферта
          </Link>

          <span className='text-center sm:text-left'>#хбдщдбдщ</span>
        </Text>
      </CopyrightContainer>
    </FooterCopyright>
  </StyleWrapper>
);

export default Footer;
