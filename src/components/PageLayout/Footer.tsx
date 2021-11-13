import React from 'react';
import Link from 'next/link';

import styled from 'styled-components';

const Footer = (): React.ReactElement => (
  <StyleWrapper>
    <div className='container'>
      <div className='footerTitle'>
        <span>Чти</span>
        <span>во</span>
      </div>
      <div className='links'>
        <Link href='/to-readers' passHref>
          <a href='fakeHref'>Чтецам</a>
        </Link>
        <Link href='/to-authors' passHref>
          <a href='fakeHref'>Авторам</a>
        </Link>
        <Link href='/to-partners' passHref>
          <a href='fakeHref'>Партнерам</a>
        </Link>
        <Link href='/about' passHref>
          <a href='fakeHref'>О Чтиве</a>
        </Link>
        <Link href='/contacts' passHref>
          <a href='fakeHref'>Контакты</a>
        </Link>
      </div>
      <div className='contacts'>
        <a
          href='https://russiandino.ru/'
          target='_blank'
          rel='noreferrer'
        >
          Создано Русским Динозавром
        </a>
        <a href='tel:+78129158367'>
          Тел. (812) 915-83-67
        </a>
        <a
          href='mailto:info@chtivo.spb.ru'
          target='_top'
        >
          E-mail info@chtivo.spb.ru
        </a>
      </div>
      <div className='copyright'>
        <span>
          © 2017-2021&nbsp;
          <span>Чти</span>
          во. Санкт-Петербург. Все права защищены.
        </span>
      </div>
    </div>
  </StyleWrapper>
);

export default Footer;

const StyleWrapper = styled.div`
  display: flex;
  width: 100%;
  max-height: 280px;
  border-top: 1px solid red;

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1480px;
    margin: 0 auto;
  }

  .footerTitle {
    margin: 25px auto 0;
    font-weight: bold;
    font-size: 57px;
    line-height: 69px;
  
    color: #A10202;
  }

  .footerTitle span:last-child {
    color: #C4C4C4;;
  }

  .links {
    margin: 15px auto 0;
    font-size: 14px;
    line-height: 26px;
  }

  .links a:not(:last-child) {
    margin-right: 37px;
  }

  .contacts {
    margin: 25px 40px 0 0;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
  }

  .contacts a:first-child {
    margin: 0 204px 0 40px;
    text-decoration: underline;
  }
  
  .contacts a:last-child {
    margin-left: 101px;
  }

  .copyright {
    margin-top: 29px;
    padding: 20px 0 20px 40px;
    font-size: 12px;
    line-height: 24px;
    border-top: 1px solid RGBA(255,255,255,0.21);
  }

  .copyright span > span {
    color: #A10202;
  }
`;
